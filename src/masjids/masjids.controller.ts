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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { MasjidsService } from './masjids.service';
import {
  CreateMasjidDto,
  UpdateMasjidDto,
  MasjidResponseDto,
  CreateMasjidAdminDto,
  UpdateMasjidAdminDto,
  MasjidAdminResponseDto,
} from './dto/masjid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role, User } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('masjids')
@Controller('masjids')
export class MasjidsController {
  constructor(private readonly masjidsService: MasjidsService) {}

  // MASJID ENDPOINTS
  @ApiOperation({ summary: 'Get all masjids' })
  @ApiResponse({
    status: 200,
    description: 'List of all masjids',
    type: [MasjidResponseDto],
  })
  @Get()
  async findAll() {
    return this.masjidsService.findAllMasjids();
  }

  @ApiOperation({ summary: 'Get a masjid by ID' })
  @ApiResponse({
    status: 200,
    description: 'The masjid',
    type: MasjidResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  @ApiParam({ name: 'id', description: 'Masjid ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.masjidsService.findMasjidById(id);
  }

  @ApiOperation({ summary: 'Create a new masjid' })
  @ApiResponse({
    status: 201,
    description: 'The masjid has been created',
    type: MasjidResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createMasjidDto: CreateMasjidDto, @Request() req) {
    return this.masjidsService.createMasjid(createMasjidDto, req.user.id);
  }

  @ApiOperation({ summary: 'Update a masjid' })
  @ApiResponse({
    status: 200,
    description: 'The masjid has been updated',
    type: MasjidResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  @ApiParam({ name: 'id', description: 'Masjid ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMasjidDto: UpdateMasjidDto,
    @Request() req,
  ) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      id,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this masjid',
      );
    }

    return this.masjidsService.updateMasjid(id, updateMasjidDto);
  }

  @ApiOperation({ summary: 'Delete a masjid' })
  @ApiResponse({ status: 204, description: 'The masjid has been deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  @ApiParam({ name: 'id', description: 'Masjid ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.masjidsService.removeMasjid(id);
    return { message: 'Masjid deleted successfully' };
  }

  // MASJID ADMIN ENDPOINTS
  @ApiOperation({ summary: 'Get all admins for a masjid' })
  @ApiResponse({
    status: 200,
    description: 'List of masjid admins',
    type: [MasjidAdminResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Masjid not found' })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':masjidId/admins')
  async findAllAdmins(@Param('masjidId') masjidId: string, @Request() req) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      masjidId,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to view masjid admins',
      );
    }

    return this.masjidsService.findAllAdmins(masjidId);
  }

  @ApiOperation({ summary: 'Get a specific admin for a masjid' })
  @ApiResponse({
    status: 200,
    description: 'The masjid admin',
    type: MasjidAdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':masjidId/admins/:adminId')
  async findOneAdmin(
    @Param('masjidId') masjidId: string,
    @Param('adminId') adminId: string,
    @Request() req,
  ) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      masjidId,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to view masjid admins',
      );
    }

    return this.masjidsService.findAdminById(masjidId, adminId);
  }

  @ApiOperation({ summary: 'Add an admin to a masjid' })
  @ApiResponse({
    status: 201,
    description: 'The admin has been added',
    type: MasjidAdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Masjid or user not found' })
  @ApiResponse({ status: 409, description: 'User is already an admin' })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':masjidId/admins')
  async addAdmin(
    @Param('masjidId') masjidId: string,
    @Body() createMasjidAdminDto: CreateMasjidAdminDto,
    @Request() req,
  ) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      masjidId,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to add masjid admins',
      );
    }

    return this.masjidsService.addAdmin(masjidId, createMasjidAdminDto);
  }

  @ApiOperation({ summary: "Update an admin's role" })
  @ApiResponse({
    status: 200,
    description: "The admin's role has been updated",
    type: MasjidAdminResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':masjidId/admins/:adminId')
  async updateAdmin(
    @Param('masjidId') masjidId: string,
    @Param('adminId') adminId: string,
    @Body() updateMasjidAdminDto: UpdateMasjidAdminDto,
    @Request() req,
  ) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      masjidId,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update masjid admins',
      );
    }

    return this.masjidsService.updateAdmin(
      masjidId,
      adminId,
      updateMasjidAdminDto,
    );
  }

  @ApiOperation({ summary: 'Remove an admin from a masjid' })
  @ApiResponse({ status: 204, description: 'The admin has been removed' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  @ApiResponse({ status: 403, description: 'Cannot remove the last admin' })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @ApiParam({ name: 'adminId', description: 'Admin ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':masjidId/admins/:adminId')
  async removeAdmin(
    @Param('masjidId') masjidId: string,
    @Param('adminId') adminId: string,
    @Request() req,
  ) {
    // Check if user is admin of this masjid or global admin
    const isGlobalAdmin =
      req.user.role === Role.ADMIN || req.user.role === Role.SUPER_ADMIN;

    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      req.user.id,
      masjidId,
    );

    if (!isGlobalAdmin && !isMasjidAdmin) {
      throw new ForbiddenException(
        'You do not have permission to remove masjid admins',
      );
    }

    await this.masjidsService.removeAdmin(masjidId, adminId);
    return { message: 'Admin removed successfully' };
  }
}
