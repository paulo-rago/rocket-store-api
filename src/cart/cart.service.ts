import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductService } from '../product/product.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productService.findOne(addToCartDto.productId);

    if (product.stock < addToCartDto.quantity) {
      throw new Error('Insufficient stock');
    }

    let cartItem = cart.items.find(item => item.product.id === product.id);

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: addToCartDto.quantity,
        price: product.price,
      });
      cart.items.push(cartItem);
    }

    return await this.cartRepository.save(cart);
  }

  async updateCartItem(userId: string, itemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (updateCartItemDto.quantity <= 0) {
      cart.items = cart.items.filter(item => item.id !== itemId);
      await this.cartItemRepository.remove(cartItem);
    } else {
      if (cartItem.product.stock < updateCartItemDto.quantity) {
        throw new Error('Insufficient stock');
      }
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return await this.cartRepository.save(cart);
  }

  async removeFromCart(userId: string, itemId: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cart.items = cart.items.filter(item => item.id !== itemId);
    await this.cartItemRepository.remove(cartItem);

    return await this.cartRepository.save(cart);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    await this.cartRepository.save(cart);
  }
} 