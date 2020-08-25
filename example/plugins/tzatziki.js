'use strict'

const assert = require('assert')
const fp = require('fastify-plugin')
const Tzatziki = require('../../index')
const {
  createUserAccount,
  getCurrentBalance,
  withdraw,
  deposit,
  sendBalance,
  sendError
} = require('../domain')

const userAccount = createUserAccount()

const initDictionary = dictionary => {
  const { Given, When, Then } = dictionary.cucumber()

  Given('a user', ctx => {
    ctx.account = userAccount
    ctx.initialBalance = ctx.account.balance
  })
  Given('requesting an available <amount>', ctx => {
    const amount = ctx.req.body.amount
    assert.ok(amount <= ctx.account.balance)
    ctx.amount = amount
  })
  Given('requesting an unavailable <amount>', ctx => {
    const amount = ctx.req.body.amount
    assert.ok(amount > ctx.account.balance)
    ctx.amount = amount
  })

  When('she queries for her current balance', ctx => {
    ctx.balance = getCurrentBalance(ctx.account)
  })
  When('she withdraws', ctx => {
    try {
      ctx.balance = withdraw(ctx.account, ctx.amount)
    } catch (err) {
      ctx.err = err
    }
  })
  When('she deposits a specific <amount>', ctx => {
    ctx.amount = ctx.req.body.amount
    try {
      ctx.balance = deposit(ctx.account, ctx.amount)
    } catch (err) {
      ctx.err = err
    }
  })

  Then('her credit is decreased by the withdrawn <amount>', ctx => {
    assert.equal(ctx.account.balance, ctx.initialBalance - ctx.amount)
  })
  Then('her credit is increased by the deposited <amount>', ctx => {
    assert.equal(ctx.account.balance, ctx.initialBalance + ctx.amount)
  })
  Then('her credit is not touched', ctx => {
    assert.equal(ctx.account.balance, ctx.initialBalance)
  })
  Then('her up-to-date balance is returned', ctx => {
    sendBalance(ctx.res, ctx.balance)
  })
  Then('an error is returned', ctx => {
    sendError(ctx.res, ctx.err)
  })

  return dictionary
}

module.exports = fp(async function (fastify, opts) {
  const tzatziki = new Tzatziki(opts)

  initDictionary(tzatziki.dictionary)

  fastify.decorate('tzatziki', tzatziki)
})
