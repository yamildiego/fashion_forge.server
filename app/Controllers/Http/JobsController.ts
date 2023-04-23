import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Job from 'App/Models/Job'
import Quote from 'App/Models/Quote'

import { schema, rules } from '@ioc:Adonis/Core/Validator'

// import { cuid } from '@ioc:Adonis/Core/Helpers'
// import fs from 'fs/promises'
// import sharp from 'sharp'
// import { Helpers } from '@adonisjs/core/build/standalone'

export default class JobsController {
  public async getAllJobs() {
    const jobsWithQuotes = await Job.query().preload('quotes').exec()
    return jobsWithQuotes
  }

  public async index({ session }) {
    const user = await User.find(session.get('userId'))
    const jobs = await user.related('jobs').query().orderBy('created_at', 'desc')
    return jobs
  }

  public async store({ request, response, session }: HttpContextContract) {
    const newJobSchema = schema.create({
      type_of_clothing: schema.string([rules.maxLength(25)]),
      description: schema.string(),
      budget: schema.number.optional(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const job = await Job.create({ ...payload, userId: session.get('userId') })

      return job
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  public async quote({ request, response, session }: HttpContextContract) {
    const newJobSchema = schema.create({
      quote: schema.number(),
      comments: schema.string.optional(),
      job_id: schema.number(),
    })

    try {
      const payload = await request.validate({ schema: newJobSchema })
      const job = await Job.find(payload.job_id)

      // 15% is added for the cost
      let quoteData = { jobId: job.id, userId: session.get('userId'), quote: payload.quote * 1.15 }

      const quote = await Quote.create(quoteData)

      return quote
    } catch (error) {
      console.log(error)
      response.badRequest(error.messages)
    }
  }

  // public async upload({ request, response }: HttpContextContract) {
  //   const images = request.files('images', {
  //     extnames: ['jpg', 'jpeg', 'png'],
  //     size: '2mb',
  //     limit: 5,
  //   })

  //   let sum: sharp.Sharp = sharp({
  //     create: {
  //       width: 1200,
  //       height: 1600,
  //       channels: 4,
  //       background: { r: 255, g: 255, b: 255, alpha: 0 },
  //     },
  //   })

  //   for await (const image of images) {
  //     const filePath = Helpers.tmpPath(`${cuid()}.${image.extname}`)
  //     await image.move(filePath)
  //     const imageBuffer = await fs.readFile(filePath)
  //     sum = sum
  //       .extend({
  //         top: 0,
  //         bottom: 0,
  //         left: 0,
  //         right: 0,
  //         background: { r: 255, g: 255, b: 255, alpha: 0 },
  //       })
  //       .composite([{ input: imageBuffer }])
  //     await fs.unlink(filePath)
  //   }

  //   const outputBuffer = await sum.png().toBuffer()
  //   // response.type('png').send(outputBuffer)
  //   response.type('png').attachment('tmp/output.png').send(outputBuffer)
  // }
  public async upload({ request, response }: HttpContextContract) {
    const images = request.files('images', {
      extnames: ['jpg', 'jpeg', 'png'],
      size: '2mb',
      limit: 5,
    })

    let sum: sharp.Sharp = sharp({
      create: {
        width: 1200,
        height: 1600,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      },
    })

    // Obtener la ruta del directorio public
    // const publicDir = path.join(__dirname, '..', 'public')

    for await (const image of images) {
      const filePath = Helpers.tmpPath(`${cuid()}.${image.extname}`)
      // const filePath = path.join(publicDir, `${cuid()}.${image.extname}`)
      await image.move(filePath)
      const imageBuffer = await fs.readFile(filePath)
      sum = sum
        .extend({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .composite([{ input: imageBuffer }])
    }

    const outputBuffer = await sum.png().toBuffer()

    // Guardar la imagen en el directorio public
    const imageName = `${cuid()}.png`
    const imagePath = path.join(publicDir, imageName)
    await fs.writeFile(imagePath, outputBuffer)

    // Construir la URL de la imagen
    const imageUrl = `https://${request.hostname()}/${imageName}`

    // Devolver la URL de la imagen en la respuesta HTTP
    response.type('png').send(imageUrl)
  }
}
