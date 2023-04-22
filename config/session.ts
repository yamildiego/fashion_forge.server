import { sessionConfig } from '@adonisjs/session/build/config'
import Env from '@ioc:Adonis/Core/Env'

export default sessionConfig({
  enabled: true,
  driver: Env.get('SESSION_DRIVER'),
  cookieName: 'adonis-session',
  clearWithBrowser: false,
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: false,
  },
  age: '2h',
  file: {}, // see the file driver
  redisConnection: 'local', // see the redis driver
})
