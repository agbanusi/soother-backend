import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { OracleType } from '../entities/aggregator.entity';

export class DeployAggregatorDto {
  @ApiProperty({
    enum: OracleType,
    description:
      'Type of oracle (0: PublicSubscribable, 1: PublicFree, 2: Private)',
  })
  @IsEnum(OracleType)
  oracleType: OracleType;

  @ApiProperty({
    description: 'Price for subscription in wei',
    example: '1000000000000000000',
  })
  @IsString()
  @IsNotEmpty()
  subscriptionPrice: string;

  @ApiProperty({
    description: 'API endpoint to fetch price data',
    example: 'https://api.example.com/price',
  })
  @IsString()
  @IsNotEmpty()
  sourceAPI: string;

  @ApiProperty({
    description: 'Owner address of the oracle',
    example: '0x1234...',
  })
  @IsString()
  @IsNotEmpty()
  owner: string;
}
