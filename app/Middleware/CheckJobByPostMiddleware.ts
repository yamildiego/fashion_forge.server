import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Job from '../Models/Job'

const CheckJobByPostMiddleware = async (
  { params, response, request }: HttpContextContract,
  next: () => void
) => {
  const jobId = request.input('id') ? request.input('id') : null

  if (!jobId) return response.status(401).send({ status: 'required_job_id' })

  const job = await Job.find(jobId)

  if (job == null) return response.status(401).send({ status: 'invalid_job_id' })

  request.job = job.toJSON()

  await next()
}

export default CheckJobByPostMiddleware
