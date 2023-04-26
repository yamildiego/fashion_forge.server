import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from '../Models/User'

const AuthMiddleware = async (
  { session, response, request }: HttpContextContract,
  next: () => void
) => {
  const userId = session.get('userId')

  if (!userId) return response.status(401).send({ status: 'session_expired' })

  const user = await User.find(userId)

  if (user == null) return response.status(401).send({ status: 'unexpected_error' })

  request.user = user.toJSON()

  await next()
}

export default AuthMiddleware
