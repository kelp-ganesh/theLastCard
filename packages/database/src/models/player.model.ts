import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'players',
  timestamps: true,
})
export class PlayerModel extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  avatarId!: string;


}
