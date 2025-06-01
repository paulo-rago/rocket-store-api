import {
  Controller,
  Get,
  Post,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  checkout(@Headers('user-id') userId: string) {
    return this.checkoutService.checkout(userId);
  }

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  getOrders(@Headers('user-id') userId: string) {
    return this.checkoutService.getOrders(userId);
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  getOrder(
    @Headers('user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.checkoutService.getOrder(userId, +id);
  }
} 