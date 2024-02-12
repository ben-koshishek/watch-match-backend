import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum YoutubeActivityType {
  LIKE = 'like',
}

@Entity()
export class YoutubeActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.youtubeActivities)
  user: User;

  @Column()
  videoId: string;

  @Column({ nullable: true })
  videoTitle: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  activityDate: Date;

  @Column({
    type: 'enum',
    enum: YoutubeActivityType,
    default: YoutubeActivityType.LIKE,
  })
  activityType: string;
}
