import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  shippingAddress: string;

  @Column({ nullable: true })
  notes: string;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @OneToMany('OrderItem', 'order')
  items: any[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 