import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class PurchaseSubscriptionDto {
  @ApiProperty({
    description: 'Oracle contract address',
    example: '0x1234...',
  })
  @IsString()
  oracleAddress: string;

  @ApiProperty({
    description: 'Duration of subscription in seconds',
    example: 31536000,
    minimum: 86400,
  })
  @IsNumber()
  @Min(86400) // Minimum 1 day
  duration: number;
}
