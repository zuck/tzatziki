'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return `
Tzatziki - Example
==================

$ curl -L localhost:3000/balance

$ curl --header "Content-Type: application/json" --data '{ "amount": 100 }' localhost:3000/deposit

$ curl --header "Content-Type: application/json" --data '{ "amount": 100 }' localhost:3000/withdrawal
`
  })
}
