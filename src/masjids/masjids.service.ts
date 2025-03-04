import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Masjid, MasjidAdmin, Role } from '@prisma/client';
import {
  CreateMasjidDto,
  UpdateMasjidDto,
  CreateMasjidAdminDto,
  UpdateMasjidAdminDto,
} from './dto/masjid.dto';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MasjidsService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.logger = new LoggerService(configService);
  }

  // MASJID OPERATIONS
  async findAllMasjids(): Promise<Masjid[]> {
    this.logger.log('Finding all masjids');
    return this.prisma.masjid.findMany();
  }

  async findMasjidById(id: string): Promise<Masjid> {
    this.logger.log(`Finding masjid with ID: ${id}`);
    const masjid = await this.prisma.masjid.findUnique({
      where: { id },
      include: {
        admins: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!masjid) {
      this.logger.error(`Masjid with ID: ${id} not found`);
      throw new NotFoundException(`Masjid with ID: ${id} not found`);
    }

    return masjid;
  }

  async createMasjid(
    createMasjidDto: CreateMasjidDto,
    userId: string,
  ): Promise<Masjid> {
    this.logger.log(`Creating new masjid with name: ${createMasjidDto.name}`);

    // Create masjid
    const masjid = await this.prisma.masjid.create({
      data: createMasjidDto,
    });

    // Automatically make the creator a masjid admin
    await this.prisma.masjidAdmin.create({
      data: {
        role: 'ADMIN',
        userId: userId,
        masjidId: masjid.id,
      },
    });

    return masjid;
  }

  async updateMasjid(
    id: string,
    updateMasjidDto: UpdateMasjidDto,
  ): Promise<Masjid> {
    // Check if masjid exists
    await this.findMasjidById(id);

    this.logger.log(`Updating masjid with ID: ${id}`);
    return this.prisma.masjid.update({
      where: { id },
      data: updateMasjidDto,
    });
  }

  async removeMasjid(id: string): Promise<void> {
    // Check if masjid exists
    await this.findMasjidById(id);

    this.logger.log(`Deleting masjid with ID: ${id}`);
    await this.prisma.masjid.delete({
      where: { id },
    });
  }

  // MASJID ADMIN OPERATIONS
  async findAllAdmins(masjidId: string): Promise<MasjidAdmin[]> {
    // Check if masjid exists
    await this.findMasjidById(masjidId);

    this.logger.log(`Finding all admins for masjid ID: ${masjidId}`);
    return this.prisma.masjidAdmin.findMany({
      where: { masjidId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });
  }

  async findAdminById(masjidId: string, adminId: string): Promise<MasjidAdmin> {
    this.logger.log(
      `Finding admin with ID: ${adminId} for masjid ID: ${masjidId}`,
    );
    const admin = await this.prisma.masjidAdmin.findFirst({
      where: {
        id: adminId,
        masjidId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            profileImage: true,
          },
        },
      },
    });

    if (!admin) {
      this.logger.error(
        `Admin with ID: ${adminId} not found for masjid ID: ${masjidId}`,
      );
      throw new NotFoundException(
        `Admin with ID: ${adminId} not found for masjid ID: ${masjidId}`,
      );
    }

    return admin;
  }

  async addAdmin(
    masjidId: string,
    createMasjidAdminDto: CreateMasjidAdminDto,
  ): Promise<MasjidAdmin> {
    // Check if masjid exists
    await this.findMasjidById(masjidId);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createMasjidAdminDto.userId },
    });

    if (!user) {
      this.logger.error(
        `User with ID: ${createMasjidAdminDto.userId} not found`,
      );
      throw new NotFoundException(
        `User with ID: ${createMasjidAdminDto.userId} not found`,
      );
    }

    // Check if user is already an admin
    const existingAdmin = await this.prisma.masjidAdmin.findFirst({
      where: {
        userId: createMasjidAdminDto.userId,
        masjidId,
      },
    });

    if (existingAdmin) {
      this.logger.error(
        `User with ID: ${createMasjidAdminDto.userId} is already an admin for masjid ID: ${masjidId}`,
      );
      throw new ConflictException(
        `User with ID: ${createMasjidAdminDto.userId} is already an admin for this masjid`,
      );
    }

    this.logger.log(
      `Adding user with ID: ${createMasjidAdminDto.userId} as admin for masjid ID: ${masjidId}`,
    );
    return this.prisma.masjidAdmin.create({
      data: {
        role: createMasjidAdminDto.role || 'ADMIN',
        userId: createMasjidAdminDto.userId,
        masjidId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateAdmin(
    masjidId: string,
    adminId: string,
    updateMasjidAdminDto: UpdateMasjidAdminDto,
  ): Promise<MasjidAdmin> {
    // Check if admin exists
    await this.findAdminById(masjidId, adminId);

    this.logger.log(
      `Updating admin with ID: ${adminId} for masjid ID: ${masjidId}`,
    );
    return this.prisma.masjidAdmin.update({
      where: { id: adminId },
      data: updateMasjidAdminDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async removeAdmin(masjidId: string, adminId: string): Promise<void> {
    // Check if admin exists
    await this.findAdminById(masjidId, adminId);

    // Check how many admins are left
    const admins = await this.prisma.masjidAdmin.findMany({
      where: { masjidId },
    });

    if (admins.length <= 1) {
      this.logger.error(
        `Cannot remove the last admin for masjid ID: ${masjidId}`,
      );
      throw new ForbiddenException(
        `Cannot remove the last admin for this masjid`,
      );
    }

    this.logger.log(
      `Removing admin with ID: ${adminId} from masjid ID: ${masjidId}`,
    );
    await this.prisma.masjidAdmin.delete({
      where: { id: adminId },
    });
  }

  // USER ACCESS CONTROL
  async checkUserIsMasjidAdmin(
    userId: string,
    masjidId: string,
  ): Promise<boolean> {
    const admin = await this.prisma.masjidAdmin.findFirst({
      where: {
        userId,
        masjidId,
      },
    });

    return !!admin;
  }
}
