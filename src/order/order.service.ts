import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
  ) {}

  async createOrder(userId: number, createOrderDto: { shippingAddress: string; notes?: string }) {
    const cart = await this.cartService.getCart(userId);
    if (!cart.items?.length) {
      throw new BadRequestException('Cart is empty');
    }

    const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = this.orderRepository.create({
      userId,
      ...createOrderDto,
      total,
    });

    const savedOrder = await this.orderRepository.save(order);
    await this.cartService.clearCart(userId);
    return savedOrder;
  }

  async findUserOrders(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items'],
    });
  }

  async findOne(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('Order does not belong to user');
    }

    return order;
  }
} 