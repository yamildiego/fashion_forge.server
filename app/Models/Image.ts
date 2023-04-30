import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import { HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'

import Job from './Job'

export default class Image extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public path: string

  @column()
  public jobId: number

  @belongsTo(() => Job, { foreignKey: 'jobId' })
  public job: BelongsTo<typeof Job>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
