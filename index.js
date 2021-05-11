const gherkin = require('gherkin').default

const GIVEN_GROUP = 'givenDefs'
const WHEN_GROUP = 'whenDefs'
const THEN_GROUP = 'thenDefs'

async function _execClauses (clauses, dictionary, context) {
  const promises = clauses.map(clause => clause.exec(dictionary, context))
  const results = await Promise.all(promises)
  return results.every(item => !!item)
}

class TzatzikiGherkinParser {
  constrcutor () {
    this.content = null
    this.lastKey = null
  }

  addStepToScenario (key, step, scenario) {
    switch (key) {
      case 'given':
        scenario.Given(step.text)
        this.lastKey = key
        break
      case 'when':
        scenario.When(step.text)
        this.lastKey = key
        break
      case 'then':
        scenario.Then(step.text)
        this.lastKey = key
        break
      case 'and':
      case 'but':
        this.addStepToScenario(this.lastKey, step, scenario)
        break
    }
  }

  async parse (path, tzatziki) {
    return new Promise((resolve, reject) => {
      this.content = null
      this.lastKey = null

      const stream = gherkin.fromPaths([path])

      stream.on('data', (chunk) => {
        if (chunk.gherkinDocument) {
          this.content = chunk.gherkinDocument.feature
        }
      })

      stream.on('end', async () => {
        if (!this.content) {
          resolve(null)
        } else {
          const feature = tzatziki.createFeature(this.content.name, this.content.description.trim())
          for (let i = 0; i < this.content.children.length; ++i) {
            const child = this.content.children[i]
            if (child.scenario) {
              const scenario = feature.createScenario(child.scenario.name)
              for (let s = 0; s < child.scenario.steps.length; ++s) {
                const step = child.scenario.steps[s]
                const key = step.keyword.trim().toLowerCase()
                this.addStepToScenario(key, step, scenario)
              }
            }
          }
          resolve(feature)
        }
      })

      stream.on('error', err => {
        reject(err)
      })
    })
  }
}

class TzatzikiDictionary {
  constructor () {
    this.givenDefs = []
    this.whenDefs = []
    this.thenDefs = []
  }

  Given (pattern, executor) {
    this.givenDefs.push({
      pattern,
      executor
    })
    return this
  }

  When (pattern, executor) {
    this.whenDefs.push({
      pattern,
      executor
    })
    return this
  }

  Then (pattern, executor) {
    this.thenDefs.push({
      pattern,
      executor
    })
    return this
  }

  cucumber () {
    return {
      Given: this.Given.bind(this),
      When: this.When.bind(this),
      Then: this.Then.bind(this)
    }
  }

  async lookup (statement, group, context) {
    const dict = this
    const ctx = context || {}
    const defs = (group in dict) ? dict[group] : []
    for (const def of defs) {
      const matches = statement.match(def.pattern)
      if (matches) {
        await def.executor.apply(ctx, matches)
        return true
      }
    }
    return false
  }
}

class TzatzikiClause {
  constructor (statement, group) {
    this.statement = statement
    this.group = group
  }

  async exec (dictionary, context) {
    const dict = dictionary || new TzatzikiDictionary()
    return dict.lookup(this.statement, this.group, context)
  }
}

class TzatzikiGivenClause extends TzatzikiClause {
  constructor (statement) {
    super(statement, GIVEN_GROUP)
  }
}

class TzatzikiWhenClause extends TzatzikiClause {
  constructor (statement) {
    super(statement, WHEN_GROUP)
  }
}

class TzatzikiThenClause extends TzatzikiClause {
  constructor (statement) {
    super(statement, THEN_GROUP)
  }
}

class TzatzikiScenario {
  constructor (name) {
    this.name = name
    this.givenClauses = []
    this.whenClauses = []
    this.thenClauses = []
  }

  Given (statement) {
    const clause = new TzatzikiGivenClause(statement)
    this.givenClauses.push(clause)
    return this
  }

  When (statement) {
    const clause = new TzatzikiWhenClause(statement)
    this.whenClauses.push(clause)
    return this
  }

  Then (statement) {
    const clause = new TzatzikiThenClause(statement)
    this.thenClauses.push(clause)
    return this
  }

  async exec (dictionary, context) {
    const doesGivenClauseMatch = await _execClauses(this.givenClauses, dictionary, context)
    if (!doesGivenClauseMatch) {
      return false
    }
    const doesWhenClauseMatch = await _execClauses(this.whenClauses, dictionary, context)
    if (!doesWhenClauseMatch) {
      return false
    }
    return await _execClauses(this.thenClauses, dictionary, context)
  }
}

class TzatzikiFeature {
  constructor (name, description) {
    this.name = name
    this.description = description
    this.scenarios = []
    this.worldCtor = Object
  }

  setWorldConstructor (worldCtor) {
    this.worldCtor = worldCtor
  }

  createScenario (name) {
    const scenario = new TzatzikiScenario(name)
    this.scenarios.push(scenario)
    return scenario
  }

  async exec (dictionary, context) {
    for (const scenario of this.scenarios) {
      // Make a copy of the original context for each scenario
      // eslint-disable-next-line new-cap
      const world = this.worldCtor()
      const ctx = Object.assign(world, context)
      // Execute the current scenario
      const res = await scenario.exec(dictionary, ctx)
      if (res) {
        return scenario
      }
    }
    throw new Error("Scenarios didn't match")
  }
}

class Tzatziki {
  constructor (opts) {
    this.opts = {
      parser: new TzatzikiGherkinParser(),
      ...opts
    }
    this.features = []
    this.dictionary = new TzatzikiDictionary()
  }

  createFeature (name, description) {
    const feature = new TzatzikiFeature(name, description)
    this.features.push(feature)
    return feature
  }

  cucumber () {
    return this.dictionary.cucumber()
  }

  async parse (path) {
    const parser = this.opts.parser
    return parser.parse(path, this)
  }
}

module.exports = Tzatziki
