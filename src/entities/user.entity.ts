import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { UserRole } from '../enums/user-role.enum'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email!: string

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: false })
  passwordHash!: string

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole

  @Column({ type: 'boolean', default: true, nullable: false })
  active!: boolean
}
