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
    sameSite: 'none',
    secure: true,
  },
  age: '2h',
  file: {
    location: '/tmp/sessions',
    driver: 'file',
    fileMode: 0o777,
  },
  redisConnection: 'local',
})
