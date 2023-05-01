import { sessionConfig } from '@adonisjs/session/build/config'
import Env from '@ioc:Adonis/Core/Env'

const LocalhostConfig = {
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
  file: {
    location: '/tmp/sessions',
  },
  redisConnection: 'local',
}

const ServerConfig = {
  enabled: true,
  driver: Env.get('SESSION_DRIVER'),
  cookieName: 'adonis-session',
  clearWithBrowser: false,
  cookie: {
    domain: '.yamildiego.com',
    path: '/',
    httpOnly: true,
    sameSite: 'none' as 'none',
    secure: true,
  },
  age: '2h',
  file: {
    location: '/tmp/sessions',
    driver: 'file',
    fileMode: 0o777,
  },
  redisConnection: 'local',
}

export default sessionConfig(Env.get('NODE_ENV') === 'production' ? ServerConfig : LocalhostConfig)
