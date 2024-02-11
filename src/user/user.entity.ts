import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
// import { YoutubeActivity } from 'src/youtube-activity/youtube-activity.entity';

@Entity()
@Unique(['email', 'username'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  googleAccessToken: string;

  @Column({ nullable: true })
  googleRefreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => YoutubeActivity, (youtubeActivity) => youtubeActivity.user)
  // youtubeActivities: YoutubeActivity[];

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
