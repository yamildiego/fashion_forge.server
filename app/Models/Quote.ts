import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'

import User from './User'
import Job from './Job'

export default class Quote extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public comments: string

  @column()
  public quote: number

  @column()
  public userId: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>

  @column()
  public jobId: number

  @belongsTo(() => Job, { foreignKey: 'jobId' })
  public job: BelongsTo<typeof Job>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
