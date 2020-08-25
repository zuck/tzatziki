'use strict'

const path = require('path')

module.exports = async function (fastify, opts) {
  const featurePath = path.join(__dirname, '../features/withdrawal.feature')
  const feature = await fastify.tzatziki.parse(featurePath)

  fastify.post('/withdrawal', function (req, res) {
    feature
      .exec(fastify.tzatziki.dictionary, { req, res })
      .catch(err => res.internalServerError(err.message))
  })
}
