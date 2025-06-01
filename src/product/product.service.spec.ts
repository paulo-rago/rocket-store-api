import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  const mockProductRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [{ id: 1, name: 'Product 1' }];
      mockProductRepository.find.mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);
      expect(mockProductRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('findOne', () => {
    const productId = 1;

    it('should return a product if found', async () => {
      const mockProduct = { id: productId, name: 'Product 1' };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId, isActive: true },
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createProductDto = {
      name: 'New Product',
      description: 'Product description',
      price: 100,
      stock: 10,
    };

    it('should create and return a new product', async () => {
      const mockProduct = { id: 1, ...createProductDto };
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('update', () => {
    const productId = 1;
    const updateProductDto = { name: 'Updated Product' };

    it('should update and return the product', async () => {
      const mockProduct = { id: productId, name: 'Old Name' };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.merge.mockImplementation((product, dto) => {
        Object.assign(product, dto);
        return product;
      });
      mockProductRepository.save.mockImplementation(product => Promise.resolve(product));

      const result = await service.update(productId, updateProductDto);

      const expectedProduct = { id: productId, name: 'Updated Product' };
      expect(result).toEqual(expectedProduct);
      expect(mockProductRepository.merge).toHaveBeenCalledWith(mockProduct, updateProductDto);
      expect(mockProductRepository.save).toHaveBeenCalledWith(expectedProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.update(productId, updateProductDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    const productId = 1;

    it('should remove the product', async () => {
      const mockProduct = { id: productId, isActive: true };
      const deactivatedProduct = { ...mockProduct, isActive: false };
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(deactivatedProduct);

      await service.remove(productId);

      expect(mockProductRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId, isActive: true },
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(deactivatedProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(productId)).rejects.toThrow(NotFoundException);
    });
  });
});
