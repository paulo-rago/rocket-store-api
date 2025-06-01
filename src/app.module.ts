import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { CartModule } from './cart/cart.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AuthModule } from './auth/auth.module';
import { Product } from './product/entities/product.entity';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Order } from './checkout/entities/order.entity';
import { OrderItem } from './checkout/entities/order-item.entity';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Product, Cart, CartItem, Order, OrderItem, User],
      synchronize: true, // Apenas para dev
    }),
    ProductModule,
    CartModule,
    CheckoutModule,
    AuthModule,
  ],
})
export class AppModule {}
