const createUserAccount = () => ({
  balance: 1000
})

const getCurrentBalance = (account) => {
  return account.balance
}

const isCreditSufficient = (account, amount) => {
  return account.balance >= amount
}

const withdraw = (account, amount) => {
  if (!isCreditSufficient(account, amount)) {
    throw new Error('Credit is insufficient!')
  }

  account.balance = account.balance - amount

  return account.balance
}

const deposit = (account, amount) => {
  account.balance = account.balance + amount

  return account.balance
}

const sendBalance = (res, balance) => {
  res.send({ balance })
}

const sendError = (res, err) => {
  res.forbidden(err.message)
}

module.exports = {
  createUserAccount,
  getCurrentBalance,
  isCreditSufficient,
  withdraw,
  deposit,
  sendBalance,
  sendError
}
