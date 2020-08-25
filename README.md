# tzatziki

A domain rules engine based on Gherkin syntax

**WARNING: this project is still highly experimental and its API may change in the future!**

**NOTE: while experimental, feedback is encouraged and really welcome!**

## Why?

The Gherkin syntax and the `cucumber` project have made writing
and execuring acceptance tests a very easy and efficient activity.

However, writing the real domain code could still be a very complex
and risking challenge.

In a *LEAN* and *Agile* world, requirements may change a lot along
the development lifecycle. The impact of complex code refactoring
can be devastating for teams, companies and client's investment.

That's the idea: **why don't model the domain logic using the same
approach used to write the acceptance tests?**

The main advantages of this approach are:

  1. Complex code is implicitly broken in small and resusable step definitions.
  2. The cost of requirement changes become less critical and the investment more valuable.
  3. Throwing away big chunks of code when requirements change is less probable.
  4. The domain code is highly decoupled from the rest of the system, making it more clean and visible.

## Getting started

First of all, let's install Tzatziki:

```bash
$ npm install --save tzatziki
```

We can now create features and scenarios using the Tzatziki API:

```js
const Tzatziki = require('tzatziki')
const tzatziki = new Tzatziki()

// Create a feature for our business domain:

const feature = tzatziki.createFeature('User profile', 'As user, I request my profile details')
const scenario = feature.createScenario('A user requests her profile')

scenario.Given('a user')
scenario.When('she requests her profile')
scenario.Then('her details are returned')

// Then, populate the dictionary of definitions to provide the logic:

tzatziki.dictionary.Given('a user', (ctx, matches) => { ... })
tzatziki.dictionary.When('she requests her profile', (ctx, matches) => { ... })
tzatziki.dictionary.Then('her details are returned', (ctx, matches) => { ... })

feature
  .exec(tzatziki.dictionary)
  .catch(err => console.log(err))
```

Alternatively, we can also use features written in Gherkin syntax to model our domain logic:

```js
const Tzatziki = require('tzatziki')
const tzatziki = new Tzatziki()

// Cucumber-style methods can be used:

const { Given, When, Then } = tzatziki.cucumber()

Given('some preconditions are matched', (ctx, matches) => { ... })
When('an action is performed', (ctx, matches) => { ... })
Then('some results are expected', (ctx, matches) => { ... })

// Parse an existing feature file:

tzatziki
  .parse('features/example.feature')
  .then(feature => feature.exec(tzatziki.dictionary))
```

## Test

```bash
$ npm test
```

## Acknowledgements

This project is kindly sponsored by:

[![heply](https://raw.githack.com/heply/brand/master/heply-logo.svg)](https://www.heply.it)

## License

Licensed under [MIT](./LICENSE)