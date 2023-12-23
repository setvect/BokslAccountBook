import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('AA_USER')
class User {
  @PrimaryColumn({ length: 20 })
  userId!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 60 })
  passwd!: string;

  @Column({ type: 'boolean', default: false })
  deleteF!: boolean;
}

export default User; // default export 사용 (ESLint 경고 해결)
