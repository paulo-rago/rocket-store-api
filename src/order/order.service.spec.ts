import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Repository<Order>;
  let orderItemRepository: Repository<OrderItem>;
  let cartService: CartService;

  const mockOrderRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrderItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockCartService = {
    getCart: jest.fn(),
    clearCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: mockOrderItemRepository,
        },
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepository = module.get<Repository<OrderItem>>(getRepositoryToken(OrderItem));
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const userId = 1;
    const createOrderDto = {
      shippingAddress: '123 Test St',
      notes: 'Test notes',
    };

    it('should create a new order from cart items', async () => {
      const mockCart = {
        id: 1,
        items: [
          {
            id: 1,
            product: { id: 1, price: 100 },
            quantity: 2,
          },
        ],
      };

      const mockOrder = {
        id: 1,
        userId,
        ...createOrderDto,
        total: 200,
        items: [
          {
            productId: 1,
            quantity: 2,
            price: 100,
          },
        ],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockCartService.clearCart.mockResolvedValue(undefined);

      const result = await service.createOrder(userId, createOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.create).toHaveBeenCalledWith({
        userId,
        ...createOrderDto,
        total: 200,
      });
      expect(mockCartService.clearCart).toHaveBeenCalledWith(userId);
    });

    it('should throw BadRequestException if cart is empty', async () => {
      mockCartService.getCart.mockResolvedValue({ items: [] });

      await expect(service.createOrder(userId, createOrderDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findUserOrders', () => {
    const userId = 1;

    it('should return user orders', async () => {
      const mockOrders = [
        { id: 1, userId },
        { id: 2, userId },
      ];
      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findUserOrders(userId);

      expect(result).toEqual(mockOrders);
      expect(mockOrderRepository.find).toHaveBeenCalledWith({
        where: { userId },
        relations: ['items'],
      });
    });
  });

  describe('findOne', () => {
    const orderId = 1;
    const userId = 1;

    it('should return order if found and belongs to user', async () => {
      const mockOrder = { id: orderId, userId };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId, userId);

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: orderId },
        relations: ['items'],
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if order belongs to different user', async () => {
      const mockOrder = { id: orderId, userId: 999 };
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      await expect(service.findOne(orderId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
}); 