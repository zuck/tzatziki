const t = require('tap')
const path = require('path')
const Tzatziki = require('../index')

t.test('tzatziki', async t => {
  t.test('dictionary', async t => {
    t.test('creating an empty dictionary', async t => {
      t.plan(3)
      const tzatziki = new Tzatziki()
      t.same(tzatziki.dictionary.givenDefs, [], 'should provide a dictionary with no given definitions')
      t.same(tzatziki.dictionary.whenDefs, [], 'should provide a dictionary with no when definitions')
      t.same(tzatziki.dictionary.thenDefs, [], 'should provide a dictionary with no then definitions')
    })

    t.test('adding a given definition to a dictionary', async t => {
      t.plan(3)
      const pattern = 'a user'
      const executor = (context, matches) => true
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(pattern, executor)
      const defs = tzatziki.dictionary.givenDefs
      t.equal(defs.length, 1, 'should add the definition to the given list')
      const def = defs[0]
      t.equal(def.pattern, pattern, 'should be registered with the given pattern')
      t.equal(def.executor, executor, 'should be registered with the given executor')
    })

    t.test('adding a when definition to a dictionary', async t => {
      t.plan(3)
      const pattern = 'requesting her profile'
      const executor = (context, matches) => true
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.When(pattern, executor)
      const defs = tzatziki.dictionary.whenDefs
      t.equal(defs.length, 1, 'should add the definition to the when list')
      const def = defs[0]
      t.equal(def.pattern, pattern, 'should be registered with the given pattern')
      t.equal(def.executor, executor, 'should be registered with the given executor')
    })

    t.test('adding a then definition to a dictionary', async t => {
      t.plan(3)
      const pattern = 'requesting her profile'
      const executor = (context, matches) => true
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Then(pattern, executor)
      const defs = tzatziki.dictionary.thenDefs
      t.equal(defs.length, 1, 'should add the definition to the then list')
      const def = defs[0]
      t.equal(def.pattern, pattern, 'should be registered with the given pattern')
      t.equal(def.executor, executor, 'should be registered with the given executor')
    })
  })

  t.test('features, scenarios & clauses', async t => {
    t.test('adding a feature', async t => {
      t.plan(3)
      const name = 'test-feature'
      const description = 'test-description'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature(name, description)
      t.equal(tzatziki.features.length, 1, 'should add it to the feature list')
      t.equal(feature.name, name, 'should be registered with the given name')
      t.equal(feature.description, description, 'should be registered with the given description')
    })

    t.test('adding a scenario to a feature', async t => {
      t.plan(2)
      const name = 'test-scenario'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario(name)
      t.equal(feature.scenarios.length, 1, 'should add it to the scenario list')
      t.equal(scenario.name, name, 'should be registered with the given name')
    })

    t.test('adding a given clause to a scenario', async t => {
      t.plan(2)
      const statement = 'a user'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(statement)
      t.equal(scenario.givenClauses.length, 1, 'should add it to the given clause list')
      const clause = scenario.givenClauses[0]
      t.equal(clause.statement, statement, 'should be registered with the given statement')
    })

    t.test('adding a when clause to a scenario', async t => {
      t.plan(2)
      const statement = 'the user completes the registration process'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.When(statement)
      t.equal(scenario.whenClauses.length, 1, 'should add it to the when clause list')
      const clause = scenario.whenClauses[0]
      t.equal(clause.statement, statement, 'should be registered with the given statement')
    })

    t.test('adding a then clause to a scenario', async t => {
      t.plan(2)
      const statement = 'send him an email'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Then(statement)
      t.equal(scenario.thenClauses.length, 1, 'should add it to the then clause list')
      const clause = scenario.thenClauses[0]
      t.equal(clause.statement, statement, 'should be registered with the given statement')
    })
  })

  t.test('exec', async t => {
    t.test('executing a clause with no matching pattern', async t => {
      t.plan(1)
      const statement = 'a user'
      const tzatziki = new Tzatziki()
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(statement)
      const clause = scenario.givenClauses[0]
      try {
        const matched = await clause.exec()
        t.equal(matched, false, 'should not match any pattern')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a clause with matching pattern on a different group', async t => {
      t.plan(2)
      let state = false
      const statement = 'a user'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.When(statement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(statement)
      const clause = scenario.givenClauses[0]
      try {
        const matched = await clause.exec()
        t.equal(matched, false, 'should not match any pattern')
        t.equal(state, false, 'should not have invoked the executor')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a clause with matching pattern on the same group', async t => {
      t.plan(2)
      let state = false
      const statement = 'a user'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(statement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(statement)
      const clause = scenario.givenClauses[0]
      try {
        const matched = await clause.exec(tzatziki.dictionary)
        t.equal(matched, true, 'should match a pattern')
        t.equal(state, true, 'should have invoked the executor')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a scenario with no matching clauses', async t => {
      t.plan(2)
      const statement = 'a user'
      const executor = () => {}
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(statement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given('a superadmin')
      try {
        await scenario.exec(tzatziki.dictionary)
        t.fail('should throw an error')
      } catch (err) {
        t.true(err, 'should throw an error')
        t.equal(err.message, "Clauses didn't match", "should notify clauses didn't match")
      }
    })

    t.test('executing a scenario with partially matching clauses', async t => {
      t.plan(3)
      let state = false
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When("requesting her brother's name")
      scenario.Then(thenStatement)
      try {
        await scenario.exec(tzatziki.dictionary)
        t.fail('should throw an error')
      } catch (err) {
        t.true(err, 'should throw an error')
        t.equal(err.message, "Clauses didn't match", "should notify clauses didn't match")
        t.equal(state, false, 'should not have invoked the executor')
      }
    })

    t.test('executing a scenario with matching clauses', async t => {
      t.plan(1)
      let state = false
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When(whenStatement)
      scenario.Then(thenStatement)
      try {
        await scenario.exec(tzatziki.dictionary)
        t.equal(state, true, 'should have invoked the executor')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a feature with not matching scenario', async t => {
      t.plan(3)
      let state = false
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When("requesting her brother's name")
      scenario.Then(thenStatement)
      try {
        await feature.exec(tzatziki.dictionary)
        t.fail('should throw an error')
      } catch (err) {
        t.true(err, 'should throw an error')
        t.equal(err.message, "Scenarios didn't match", "should notify scenarios didn't match")
        t.equal(state, false, 'should not have invoked the executor')
      }
    })

    t.test('executing a feature with matching scenario', async t => {
      t.plan(1)
      let state = false
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = () => { state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When(whenStatement)
      scenario.Then(thenStatement)
      try {
        await feature.exec(tzatziki.dictionary)
        t.equal(state, true, 'should have invoked the executor')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a feature setting a world constructor', async t => {
      t.plan(1)
      let state = false
      const createWorld = () => ({
        setState: val => { state = val }
      })
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = function () { this.setState(true) }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When(whenStatement)
      scenario.Then(thenStatement)
      feature.setWorldConstructor(createWorld)
      try {
        await feature.exec(tzatziki.dictionary)
        t.equal(state, true, 'should be able to modify the given world context')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('executing a scenario passing a context object', async t => {
      t.plan(1)
      const ctx = {
        state: false
      }
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const executor = function () { this.state = true }
      const tzatziki = new Tzatziki()
      tzatziki.dictionary.Given(givenStatement, () => true)
      tzatziki.dictionary.When(whenStatement, () => true)
      tzatziki.dictionary.Then(thenStatement, executor)
      const feature = tzatziki.createFeature()
      const scenario = feature.createScenario()
      scenario.Given(givenStatement)
      scenario.When(whenStatement)
      scenario.Then(thenStatement)
      try {
        await scenario.exec(tzatziki.dictionary, ctx)
        t.equal(ctx.state, true, 'should be able to modify the given context')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })
  })

  t.test('cucumber', async t => {
    t.test('add definitions using cucumber-like syntax', async t => {
      t.plan(3)
      const givenStatement = 'a user'
      const whenStatement = 'requesting her profile'
      const thenStatement = 'should return it'
      const tzatziki = new Tzatziki()
      const { Given, When, Then } = tzatziki.cucumber()
      Given(givenStatement, () => true)
      When(whenStatement, () => true)
      Then(thenStatement, () => true)
      t.equal(tzatziki.dictionary.givenDefs.length, 1, 'should have added a given definition')
      t.equal(tzatziki.dictionary.whenDefs.length, 1, 'should have added a when definition')
      t.equal(tzatziki.dictionary.thenDefs.length, 1, 'should have added a then definition')
    })
  })

  t.test('parse', async t => {
    t.test('parsing an empty feature file', async t => {
      t.plan(1)
      const tzatziki = new Tzatziki()
      const featurePath = path.join(__dirname, 'features/empty.feature')
      try {
        await tzatziki.parse(featurePath)
        t.equal(tzatziki.features.length, 0, 'should not add any feature to the list')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('parsing a valid feature file', async t => {
      t.plan(2)
      const tzatziki = new Tzatziki()
      const featurePath = path.join(__dirname, 'features/example01.feature')
      try {
        const feature = await tzatziki.parse(featurePath)
        t.equal(tzatziki.features.length, 1, 'should add a feature to the list')
        t.equal(feature.scenarios.length, 3, 'should add all scenarios described in the file')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })

    t.test('parsing a feature file with AND and BUT', async t => {
      t.plan(4)
      const tzatziki = new Tzatziki()
      const featurePath = path.join(__dirname, 'features/example02.feature')
      try {
        const feature = await tzatziki.parse(featurePath)
        t.equal(tzatziki.features.length, 1, 'should add a feature to the list')
        t.equal(feature.scenarios.length, 1, 'should add all scenarios described in the file')
        const scenario = feature.scenarios[0]
        t.equal(scenario.whenClauses.length, 2, 'should include AND clauses described in the scenario')
        t.equal(scenario.thenClauses.length, 2, 'should include BUT clauses described in the scenario')
      } catch (err) {
        console.log(err)
        t.error(err, 'should not throw an error')
      }
    })
  })
})
