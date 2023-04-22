import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class Job extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public type_of_clothing: string

  @column()
  public description: string

  @column()
  public budget: number

  @column()
  public userId: number

  @belongsTo(() => User, { foreignKey: 'userId' })
  public user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
