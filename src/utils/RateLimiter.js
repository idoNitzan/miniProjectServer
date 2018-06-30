import redis from 'redis'
import moment from 'moment'
import bluebird from 'bluebird'

export default class RateLimiter {
  constructor() {
    bluebird.promisifyAll(redis.RedisClient.prototype)
    bluebird.promisifyAll(redis.Multi.prototype)
    this.redisClient = redis.createClient({ host: 'localhost' })
  }

  async getSessionFailuresCount(sessionId) {
    return Number.parseInt(await this.redisClient.getAsync(sessionId)) || 0
  }

  async incrementSessionFailuresCount(sessionId) {
    const expirationTime = moment()
      .startOf('minute')
      .add(1, 'minute')
      .unix()

    await this.redisClient
      .multi()
      .incr(sessionId)
      .expireat(sessionId, expirationTime)
      .execAsync()
  }

  async blockSessionFor2Minutes(sessionId) {
    const expirationTime = moment().add(2, 'minute').unix()
    const key = sessionId + 'blocked'

    await this.redisClient
      .multi()
      .incr(key)
      .expireat(key, expirationTime)
      .execAsync()
  }

  async isSessionBlocked(sessionId) {
    return await this.redisClient.getAsync(sessionId + 'blocked')
  }
}
