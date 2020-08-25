const assert = require('assert')
const { Given, When, Then } = require('cucumber')
const {
  createUserAccount,
  getCurrentBalance,
  deposit,
  withdraw
} = require('../../domain')

Given('a user', function () {
  this.account = createUserAccount()
  this.initialBalance = this.account.balance
})
Given('requesting an available <amount>', function () {
  this.amount = this.account.balance
})
Given('requesting an unavailable <amount>', function () {
  this.amount = this.account.balance + 1
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
  this.amount = 50
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
  assert.equal(this.account.balance, this.balance)
})
Then('an error is returned', function () {
  assert.ok(this.err)
})
