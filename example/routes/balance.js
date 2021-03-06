'use strict'

const path = require('path')

module.exports = async function (fastify, opts) {
  const featurePath = path.join(__dirname, '../features/balance.feature')
  const feature = await fastify.tzatziki.parse(featurePath)

  fastify.get('/balance', function (req, res) {
    feature
      .exec(fastify.tzatziki.dictionary, { req, res })
      .catch(err => res.internalServerError(err.message))
  })
}
