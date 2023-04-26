import Env from '@ioc:Adonis/Core/Env'

const mailConfig = {
  host: Env.get('SMTP_HOST'),
  port: Env.get('SMTP_PORT'),
  auth: {
    user: Env.get('SMTP_PORT'),
    pass: Env.get('SMTP_PASSWORD'),
  },
}
export default mailConfig
