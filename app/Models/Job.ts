import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Client from './Client'

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
  public clientId: number

  @belongsTo(() => Client, { foreignKey: 'clientId' })
  public client: BelongsTo<typeof Client>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  images() {
    return this.hasMany('App/Models/Image')
  }
}
