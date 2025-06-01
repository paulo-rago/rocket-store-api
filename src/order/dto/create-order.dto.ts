import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Shipping address for the order' })
  @IsString()
  shippingAddress: string;

  @ApiPropertyOptional({ description: 'Optional notes for the order' })
  @IsString()
  @IsOptional()
  notes?: string;
} 