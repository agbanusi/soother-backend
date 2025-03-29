// aggregator.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

// Define OracleType enum
export enum OracleType {
  PublicSubscribable = 0,
  PublicFree = 1,
  Private = 2,
}

@Entity()
export class Aggregator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractAddress: string;

  @Column()
  owner: string;

  @Column({ type: 'enum', enum: OracleType })
  oracleType: OracleType;

  @Column('decimal')
  subscriptionPrice: number;

  @Column()
  sourceAPI: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
