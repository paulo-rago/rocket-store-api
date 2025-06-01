import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);
    const product = await this.productRepository.findOne({
      where: { id: addToCartDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
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

  async updateCartItem(userId: number, itemId: number, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
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
        throw new BadRequestException('Insufficient stock');
      }
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return await this.cartRepository.save(cart);
  }

  async removeFromCart(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const cartItem = cart.items.find(item => item.id === itemId);

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    cart.items = cart.items.filter(item => item.id !== itemId);
    await this.cartItemRepository.remove(cartItem);

    return await this.cartRepository.save(cart);
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });
    
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartItemRepository.remove(cart.items);
    cart.items = [];
    await this.cartRepository.save(cart);
  }
} 