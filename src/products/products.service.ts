import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')

  onModuleInit() {
    this.$connect();
    this.logger.log('---- Database connected ----')
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto })
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const totalPages = await this.product.count();

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: +limit
      }),
      meta: {
        page,
        total: totalPages
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({ where: { id } });

    if (!product) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.NOT_FOUND
      })
    }

    return await this.product.findUnique({ where: { id } })
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const { id: __, ...data } = updateProductDto
    await this.product.update({
      where: { id },
      data: data
    })
    return {
      id, updateProductDto
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return await this.product.delete({ where: { id } })
  }

  async validateProduct(ids: number[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    if(products.length !== ids.length){
      throw new RpcException({
        message:'Some products were not found',
        status: HttpStatus.BAD_REQUEST
      });
    }

    return products;
  }
}
