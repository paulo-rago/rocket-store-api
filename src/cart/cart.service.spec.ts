import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../product/entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: Repository<Cart>;
  let cartItemRepository: Repository<CartItem>;
  let productRepository: Repository<Product>;

  const mockCartRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockCartItemRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  const mockProductRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: mockCartRepository,
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: mockCartItemRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
    cartItemRepository = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    const userId = 1;

    it('should return existing cart', async () => {
      const mockCart = { id: 1, userId, items: [] };
      mockCartRepository.findOne.mockResolvedValue(mockCart);

      const result = await service.getCart(userId);

      expect(result).toEqual(mockCart);
      expect(mockCartRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items', 'items.product'],
      });
    });

    it('should create new cart if not exists', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      const newCart = { id: 1, userId, items: [] };
      mockCartRepository.create.mockReturnValue(newCart);
      mockCartRepository.save.mockResolvedValue(newCart);

      const result = await service.getCart(userId);

      expect(result).toEqual(newCart);
      expect(mockCartRepository.create).toHaveBeenCalledWith({ userId });
      expect(mockCartRepository.save).toHaveBeenCalledWith(newCart);
    });
  });

  describe('addToCart', () => {
    const userId = 1;
    const addToCartDto = {
      productId: 1,
      quantity: 2,
    };

    it('should add new item to cart', async () => {
      const mockCart = { id: 1, userId, items: [] };
      const mockProduct = { id: 1, name: 'Test Product', price: 100, stock: 10 };
      const mockCartItem = {
        id: 1,
        quantity: 2,
        price: mockProduct.price,
        product: mockProduct,
      };

      mockCartRepository.findOne.mockResolvedValue(mockCart);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepository.create.mockReturnValue(mockCartItem);
      mockCartRepository.save.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      const result = await service.addToCart(userId, addToCartDto);

      expect(result.items[0]).toEqual(mockCartItem);
      expect(mockCartItemRepository.create).toHaveBeenCalledWith({
        cart: mockCart,
        product: mockProduct,
        quantity: addToCartDto.quantity,
        price: mockProduct.price,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockCartRepository.findOne.mockResolvedValue({ id: 1, items: [] });
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.addToCart(userId, addToCartDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity exceeds stock', async () => {
      const mockProduct = { id: 1, stock: 1 };
      mockCartRepository.findOne.mockResolvedValue({ id: 1, items: [] });
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      await expect(service.addToCart(userId, addToCartDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeFromCart', () => {
    const userId = 1;
    const itemId = 1;

    it('should remove item from cart', async () => {
      const mockCartItem = { id: itemId };
      const mockCart = {
        id: 1,
        userId,
        items: [mockCartItem],
      };

      mockCartRepository.findOne.mockResolvedValue(mockCart);
      mockCartItemRepository.remove.mockResolvedValue(mockCartItem);
      mockCartRepository.save.mockResolvedValue({ ...mockCart, items: [] });

      await service.removeFromCart(userId, itemId);

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(mockCartItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      const mockCart = { id: 1, userId, items: [] };
      mockCartRepository.findOne.mockResolvedValue(mockCart);

      await expect(service.removeFromCart(userId, itemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart', () => {
    const userId = 1;

    it('should clear all items from cart', async () => {
      const mockCartItems = [{ id: 1 }, { id: 2 }];
      const mockCart = { id: 1, userId, items: mockCartItems };
      mockCartRepository.findOne.mockResolvedValue(mockCart);
      mockCartItemRepository.remove.mockResolvedValue(mockCartItems);
      mockCartRepository.save.mockResolvedValue({ ...mockCart, items: [] });

      await service.clearCart(userId);

      expect(mockCartItemRepository.remove).toHaveBeenCalledWith(mockCartItems);
      expect(mockCartRepository.save).toHaveBeenCalledWith({ ...mockCart, items: [] });
    });

    it('should throw NotFoundException if cart not found', async () => {
      mockCartRepository.findOne.mockResolvedValue(null);
      mockCartRepository.create.mockReturnValue({ userId, items: [] });
      mockCartRepository.save.mockResolvedValue(null);

      await expect(service.clearCart(userId)).rejects.toThrow(NotFoundException);
    });
  });
}); 