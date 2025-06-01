import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  async checkout(userId: string): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart.items.length) {
      throw new NotFoundException('Cart is empty');
    }

    // Verify stock and calculate total
    let total = 0;
    for (const item of cart.items) {
      const product = await this.productService.findOne(item.product.id);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
      total += item.price * item.quantity;
    }

    // Create order
    const order = this.orderRepository.create({
      userId,
      total,
      status: 'PENDING',
    });
    await this.orderRepository.save(order);

    // Create order items and update stock
    for (const item of cart.items) {
      const orderItem = this.orderItemRepository.create({
        order,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
      await this.productService.updateStock(item.product.id, item.quantity);
    }

    // Clear cart
    await this.cartService.clearCart(userId);

    // Update order status
    order.status = 'COMPLETED';
    return await this.orderRepository.save(order);
  }

  async getOrders(userId: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrder(userId: string, orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
} 