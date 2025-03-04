import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UserResponseDto,
  UpdateUserDto,
  AdminUpdateUserDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return all users',
    type: [UserResponseDto],
  })
  async findAll(@Request() req): Promise<UserResponseDto[]> {
    // Only admin users can list all users
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to access all users',
      );
    }
    return this.usersService.findAll() as Promise<UserResponseDto[]>;
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Return the current user',
    type: UserResponseDto,
  })
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.usersService.findOne(req.user.id) as Promise<UserResponseDto>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id (Admin or own profile)' })
  @ApiResponse({
    status: 200,
    description: 'Return the user',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UserResponseDto> {
    // Users can only access their own profile, admins can access any profile
    if (
      req.user.id !== id &&
      req.user.role !== Role.ADMIN &&
      req.user.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to access this user',
      );
    }
    return this.usersService.findOne(id) as Promise<UserResponseDto>;
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User has been updated',
    type: UserResponseDto,
  })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(
      req.user.id,
      updateUserDto,
    ) as Promise<UserResponseDto>;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User has been updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: AdminUpdateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    // Only admins can update other users with extended privileges
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }
    return this.usersService.adminUpdate(
      id,
      updateUserDto,
    ) as Promise<UserResponseDto>;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User has been deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    // Only admins can delete users
    if (req.user.role !== Role.ADMIN && req.user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to delete users',
      );
    }
    return this.usersService.remove(id);
  }
}
