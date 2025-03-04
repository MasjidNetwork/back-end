import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Campaign, Donation, DonationStatus } from '@prisma/client';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateDonationDto,
  UpdateDonationDto,
} from './dto/campaign.dto';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { MasjidsService } from '../masjids/masjids.service';

@Injectable()
export class CampaignsService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private masjidsService: MasjidsService,
    private configService: ConfigService,
  ) {
    this.logger = new LoggerService(configService);
  }

  // CAMPAIGN OPERATIONS
  async findAllCampaigns(activeOnly = false): Promise<Campaign[]> {
    this.logger.log('Finding all campaigns');
    const where = activeOnly ? { isActive: true } : {};

    return this.prisma.campaign.findMany({
      where,
      include: {
        masjid: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });
  }

  async findCampaignsByMasjid(masjidId: string): Promise<Campaign[]> {
    this.logger.log(`Finding campaigns for masjid ID: ${masjidId}`);
    // Verify masjid exists
    await this.masjidsService.findMasjidById(masjidId);

    return this.prisma.campaign.findMany({
      where: { masjidId },
    });
  }

  async findCampaignById(id: string): Promise<Campaign> {
    this.logger.log(`Finding campaign with ID: ${id}`);
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        masjid: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!campaign) {
      this.logger.error(`Campaign with ID: ${id} not found`);
      throw new NotFoundException(`Campaign with ID: ${id} not found`);
    }

    return campaign;
  }

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    // Verify masjid exists and user is an admin
    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      userId,
      createCampaignDto.masjidId,
    );

    if (!isMasjidAdmin) {
      this.logger.error(
        `User with ID: ${userId} is not an admin for masjid ID: ${createCampaignDto.masjidId}`,
      );
      throw new ForbiddenException(
        'You must be a masjid admin to create campaigns',
      );
    }

    this.logger.log(
      `Creating new campaign with title: ${createCampaignDto.title}`,
    );
    return this.prisma.campaign.create({
      data: {
        ...createCampaignDto,
        // Initialize raised amount to 0
        raised: 0,
      },
    });
  }

  async updateCampaign(
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    userId: string,
  ): Promise<Campaign> {
    // Check if campaign exists
    const campaign = await this.findCampaignById(id);

    // Verify user is a masjid admin
    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      userId,
      campaign.masjidId,
    );

    if (!isMasjidAdmin) {
      this.logger.error(
        `User with ID: ${userId} is not an admin for masjid ID: ${campaign.masjidId}`,
      );
      throw new ForbiddenException(
        'You must be a masjid admin to update campaigns',
      );
    }

    this.logger.log(`Updating campaign with ID: ${id}`);
    return this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
    });
  }

  async removeCampaign(id: string, userId: string): Promise<void> {
    // Check if campaign exists
    const campaign = await this.findCampaignById(id);

    // Verify user is a masjid admin
    const isMasjidAdmin = await this.masjidsService.checkUserIsMasjidAdmin(
      userId,
      campaign.masjidId,
    );

    if (!isMasjidAdmin) {
      this.logger.error(
        `User with ID: ${userId} is not an admin for masjid ID: ${campaign.masjidId}`,
      );
      throw new ForbiddenException(
        'You must be a masjid admin to delete campaigns',
      );
    }

    // Check if campaign has donations
    const donationCount = await this.prisma.donation.count({
      where: { campaignId: id },
    });

    if (donationCount > 0) {
      this.logger.error(
        `Cannot delete campaign with ID: ${id} because it has donations`,
      );
      throw new ForbiddenException(
        'Cannot delete a campaign that has donations',
      );
    }

    this.logger.log(`Deleting campaign with ID: ${id}`);
    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  // DONATION OPERATIONS
  async findDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    // Check if campaign exists
    await this.findCampaignById(campaignId);

    this.logger.log(`Finding donations for campaign ID: ${campaignId}`);
    return this.prisma.donation.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findDonationById(id: string): Promise<Donation> {
    this.logger.log(`Finding donation with ID: ${id}`);
    const donation = await this.prisma.donation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        campaign: true,
        paymentDetails: true,
      },
    });

    if (!donation) {
      this.logger.error(`Donation with ID: ${id} not found`);
      throw new NotFoundException(`Donation with ID: ${id} not found`);
    }

    return donation;
  }

  async createDonation(
    createDonationDto: CreateDonationDto,
    userId?: string,
  ): Promise<Donation> {
    // Check if campaign exists
    const campaign = await this.findCampaignById(createDonationDto.campaignId);

    // Check if campaign is active
    if (!campaign.isActive) {
      this.logger.error(
        `Campaign with ID: ${createDonationDto.campaignId} is not active`,
      );
      throw new ForbiddenException('Cannot donate to an inactive campaign');
    }

    this.logger.log(
      `Creating new donation for campaign ID: ${createDonationDto.campaignId}`,
    );

    // Create the donation with pending status
    const donation = await this.prisma.donation.create({
      data: {
        ...createDonationDto,
        userId,
        status: DonationStatus.PENDING,
      },
    });

    // Note: In a real implementation, you would integrate with a payment processor here
    // For now, we'll just mark it as completed automatically

    // Update the donation status to completed
    const updatedDonation = await this.updateDonationStatus(
      donation.id,
      DonationStatus.COMPLETED,
      'payment-test-id',
    );

    return updatedDonation;
  }

  async updateDonationStatus(
    id: string,
    status: DonationStatus,
    transactionId?: string,
  ): Promise<Donation> {
    const donation = await this.findDonationById(id);

    this.logger.log(`Updating donation with ID: ${id} to status: ${status}`);

    // If donation is being completed, update the campaign raised amount
    if (
      status === DonationStatus.COMPLETED &&
      donation.status !== DonationStatus.COMPLETED
    ) {
      await this.updateCampaignRaisedAmount(
        donation.campaignId,
        Number(donation.amount),
      );
    }

    // If donation was completed but is now being refunded, subtract from campaign raised amount
    if (
      status === DonationStatus.REFUNDED &&
      donation.status === DonationStatus.COMPLETED
    ) {
      await this.updateCampaignRaisedAmount(
        donation.campaignId,
        -Number(donation.amount),
      );
    }

    return this.prisma.donation.update({
      where: { id },
      data: {
        status,
        transactionId,
      },
    });
  }

  private async updateCampaignRaisedAmount(
    campaignId: string,
    amountChange: number,
  ): Promise<void> {
    const campaign = await this.findCampaignById(campaignId);

    const updatedRaisedAmount = +campaign.raised + +amountChange;

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        raised: updatedRaisedAmount < 0 ? 0 : updatedRaisedAmount,
      },
    });
  }
}
