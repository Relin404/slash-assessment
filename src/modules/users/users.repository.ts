import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { UpdateUserDto } from 'src/modules/users/dtos/update-user.dto';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassword(createUserDto.password);

    let user;

    try {
      user = await this.prismaClient.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });
    } catch (error) {
      if (error.code === 'P2002')
        throw new ConflictException('User already exists');

      throw error;
    }

    return user;
  }

  async findAll() {
    const users = await this.prismaClient.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        joinedAt: true,
        updatedAt: true,
      },
    });

    return users;
  }

  async findOne(id: number) {
    return await this.prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        joinedAt: true,
        updatedAt: true,
      },
    });
  }

  async findOneByEmailUnsafe(email: string) {
    return await this.prismaClient.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let user;

    try {
      user = await this.prismaClient.user.update({
        where: { id },
        data: updateUserDto,
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          joinedAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('User not found');

      throw error;
    }

    return user;
  }

  async delete(id: number) {
    let user;

    try {
      user = await this.prismaClient.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          joinedAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') throw new NotFoundException('User not found');

      throw error;
    }

    return user;
  }

  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
  }

  async validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
