import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Rocket Model X',
    description: 'The name of the product'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'High-performance model rocket with advanced stabilization',
    description: 'Detailed description of the product'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 299.99,
    description: 'The price of the product in USD',
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available quantity in stock',
    minimum: 0
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;
} 