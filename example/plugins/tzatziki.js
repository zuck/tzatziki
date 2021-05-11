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

  Given('a user', function () {
    this.account = userAccount
    this.initialBalance = this.account.balance
  })
  Given('requesting an available <amount>', function () {
    const amount = this.req.body.amount
    assert.ok(amount <= this.account.balance)
    this.amount = amount
  })
  Given('requesting an unavailable <amount>', function () {
    const amount = this.req.body.amount
    assert.ok(amount > this.account.balance)
    this.amount = amount
  })

  When('she queries for her current balance', function () {
    this.balance = getCurrentBalance(this.account)
  })
  When('she withdraws', function () {
    try {
      this.balance = withdraw(this.account, this.amount)
    } catch (err) {
      this.err = err
    }
  })
  When('she deposits a specific <amount>', function () {
    this.amount = this.req.body.amount
    try {
      this.balance = deposit(this.account, this.amount)
    } catch (err) {
      this.err = err
    }
  })

  Then('her credit is decreased by the withdrawn <amount>', function () {
    assert.equal(this.account.balance, this.initialBalance - this.amount)
  })
  Then('her credit is increased by the deposited <amount>', function () {
    assert.equal(this.account.balance, this.initialBalance + this.amount)
  })
  Then('her credit is not touched', function () {
    assert.equal(this.account.balance, this.initialBalance)
  })
  Then('her up-to-date balance is returned', function () {
    sendBalance(this.res, this.balance)
  })
  Then('an error is returned', function () {
    sendError(this.res, this.err)
  })

  return dictionary
}

module.exports = fp(async function (fastify, opts) {
  const tzatziki = new Tzatziki(opts)

  initDictionary(tzatziki.dictionary)

  fastify.decorate('tzatziki', tzatziki)
})
