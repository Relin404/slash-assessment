import { Injectable, NotFoundException } from '@nestjs/common';
import { CartService } from 'src/modules/cart/cart.service';
import { OrdersService } from 'src/modules/orders/orders.service';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dtos/update-user.dto';
import { UsersRepository } from 'src/modules/users/users.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.usersRepository.create(createUserDto);

    await this.cartService.createCart(user.id);

    user.password = undefined;

    return user;
  }

  async findAll() {
    return await this.usersRepository.findAll();
  }

  async findOneById(id: number) {
    const user = await this.usersRepository.findOne(id);

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOneByEmailUnsafe(email);

    if (!user) throw new NotFoundException('User not found');

    user.password = undefined;

    return user;
  }

  async getUserOrdersHistory(userId: number) {
    const user = await this.usersRepository.findOne(userId);

    return await this.ordersService.getOrders(userId);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.update(id, updateUserDto);

    return user;
  }

  async delete(id: number) {
    const user = await this.usersRepository.delete(id);

    return user;
  }

  async validatePassword(email: string, password: string) {
    const user = await this.usersRepository.validatePassword(email, password);

    return user;
  }
}
