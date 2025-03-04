// aggregator.entity.ts
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
