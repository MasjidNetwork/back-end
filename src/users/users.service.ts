import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
  AdminUpdateUserDto,
} from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.logger = new LoggerService(configService);
    this.logger.setContext('UsersService');
  }

  async findAll(): Promise<Partial<User>[]> {
    this.logger.log('Finding all users');
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        // Never include password
      },
    });
  }

  async findOne(id: string): Promise<Partial<User>> {
    this.logger.log(`Finding user with ID: ${id}`);
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        // Never include password
      },
    });

    if (!user) {
      this.logger.error(`User with ID: ${id} not found`);
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password, role } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.error(`User with email: ${email} already exists`);
      throw new ConflictException(`User with email: ${email} already exists`);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    this.logger.log(`Creating new user with email: ${email}`);
    const newUser = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        role: role || Role.USER, // Default to USER role if not specified
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    // Check if user exists
    await this.findOne(id);

    // Update user
    this.logger.log(`Updating user with ID: ${id}`);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        // Never include password
      },
    });

    return updatedUser;
  }

  async adminUpdate(
    id: string,
    updateUserDto: AdminUpdateUserDto,
  ): Promise<Partial<User>> {
    // Check if user exists
    await this.findOne(id);

    // Update user with admin privileges
    this.logger.log(`Admin updating user with ID: ${id}`);
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
        lastLogin: true,
        // Never include password
      },
    });

    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    // Check if user exists
    await this.findOne(id);

    // Delete user
    this.logger.log(`Deleting user with ID: ${id}`);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}
