import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentDetail, DonationStatus } from '@prisma/client';
import {
  CreatePaymentDetailDto,
  UpdatePaymentDetailDto,
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
} from './dto/payment.dto';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { CampaignsService } from '../campaigns/campaigns.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private campaignsService: CampaignsService,
    private configService: ConfigService,
  ) {
    this.logger = new LoggerService(configService);
    // In a real application, you would initialize your payment provider here
    // e.g. this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {});
  }

  async findAllPaymentDetails(): Promise<PaymentDetail[]> {
    this.logger.log('Finding all payment details');
    return this.prisma.paymentDetail.findMany();
  }

  async findPaymentDetailById(id: string): Promise<PaymentDetail> {
    this.logger.log(`Finding payment detail with ID: ${id}`);
    const paymentDetail = await this.prisma.paymentDetail.findUnique({
      where: { id },
      include: {
        donation: true,
      },
    });

    if (!paymentDetail) {
      this.logger.error(`Payment detail with ID: ${id} not found`);
      throw new NotFoundException(`Payment detail with ID: ${id} not found`);
    }

    return paymentDetail;
  }

  async findPaymentDetailByDonationId(
    donationId: string,
  ): Promise<PaymentDetail> {
    this.logger.log(`Finding payment detail for donation ID: ${donationId}`);
    const paymentDetail = await this.prisma.paymentDetail.findUnique({
      where: { donationId },
      include: {
        donation: true,
      },
    });

    if (!paymentDetail) {
      this.logger.error(
        `Payment detail for donation ID: ${donationId} not found`,
      );
      throw new NotFoundException(
        `Payment detail for donation ID: ${donationId} not found`,
      );
    }

    return paymentDetail;
  }

  async createPaymentDetail(
    createPaymentDetailDto: CreatePaymentDetailDto,
  ): Promise<PaymentDetail> {
    // Check if the donation exists
    const donation = await this.prisma.donation.findUnique({
      where: { id: createPaymentDetailDto.donationId },
    });

    if (!donation) {
      this.logger.error(
        `Donation with ID: ${createPaymentDetailDto.donationId} not found`,
      );
      throw new NotFoundException(
        `Donation with ID: ${createPaymentDetailDto.donationId} not found`,
      );
    }

    this.logger.log(
      `Creating payment detail for donation ID: ${createPaymentDetailDto.donationId}`,
    );
    return this.prisma.paymentDetail.create({
      data: createPaymentDetailDto,
    });
  }

  async updatePaymentDetail(
    id: string,
    updatePaymentDetailDto: UpdatePaymentDetailDto,
  ): Promise<PaymentDetail> {
    // Check if payment detail exists
    await this.findPaymentDetailById(id);

    this.logger.log(`Updating payment detail with ID: ${id}`);
    return this.prisma.paymentDetail.update({
      where: { id },
      data: updatePaymentDetailDto,
    });
  }

  async removePaymentDetail(id: string): Promise<void> {
    // Check if payment detail exists
    await this.findPaymentDetailById(id);

    this.logger.log(`Deleting payment detail with ID: ${id}`);
    await this.prisma.paymentDetail.delete({
      where: { id },
    });
  }

  // Stripe integration methods
  async createPaymentIntent(
    createPaymentIntentDto: CreatePaymentIntentDto,
    userId?: string,
  ): Promise<PaymentIntentResponseDto> {
    // Verify the campaign exists
    const campaign = await this.campaignsService.findCampaignById(
      createPaymentIntentDto.campaignId,
    );

    if (!campaign.isActive) {
      this.logger.error(
        `Campaign with ID: ${createPaymentIntentDto.campaignId} is not active`,
      );
      throw new BadRequestException('Cannot donate to an inactive campaign');
    }

    this.logger.log(
      `Creating payment intent for campaign ID: ${createPaymentIntentDto.campaignId}`,
    );

    // In a real implementation, you would create a Stripe payment intent here
    // For this example, we'll simulate the response

    // First create a pending donation
    const donation = await this.prisma.donation.create({
      data: {
        amount: createPaymentIntentDto.amount,
        paymentMethod: createPaymentIntentDto.paymentMethod,
        isAnonymous: createPaymentIntentDto.isAnonymous || false,
        message: createPaymentIntentDto.message,
        status: DonationStatus.PENDING,
        userId: userId,
        campaignId: createPaymentIntentDto.campaignId,
      },
    });

    // Simulate Stripe payment intent response
    const paymentIntentId = `pi_${uuidv4().replace(/-/g, '')}`;
    const clientSecret = `${paymentIntentId}_secret_${uuidv4().replace(/-/g, '')}`;

    // In a real implementation, we would store the payment intent ID with the donation
    // For this example, we'll just return it
    return {
      clientSecret,
      paymentIntentId,
      donationId: donation.id,
    };
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    donationId: string,
  ): Promise<void> {
    this.logger.log(
      `Confirming payment intent: ${paymentIntentId} for donation: ${donationId}`,
    );

    // In a real implementation, you would verify the payment intent status with Stripe
    // For this example, we'll just update the donation and create payment details

    // Update donation status to completed
    await this.prisma.donation.update({
      where: { id: donationId },
      data: {
        status: DonationStatus.COMPLETED,
        transactionId: paymentIntentId,
      },
    });

    // Create payment details
    await this.prisma.paymentDetail.create({
      data: {
        provider: 'STRIPE',
        paymentMethodId: 'pm_simulated',
        receiptUrl: `https://dashboard.stripe.com/payments/${paymentIntentId}`,
        metadata: { paymentIntent: paymentIntentId },
        donationId: donationId,
      },
    });

    // Update campaign raised amount
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (donation) {
      await this.campaignsService['updateCampaignRaisedAmount'](
        donation.campaignId,
        Number(donation.amount),
      );
    }
  }

  async handleWebhook(payload: any, signature: string): Promise<void> {
    this.logger.log('Processing payment webhook');

    // In a real implementation, you would verify the webhook signature and process the event
    // For this example, we'll just log it

    /*
    Example webhook handling code:
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET')
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await this.confirmPaymentIntent(paymentIntent.id, paymentIntent.metadata.donationId);
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          await this.handleFailedPayment(failedPaymentIntent.id, failedPaymentIntent.metadata.donationId);
          break;
        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Webhook error: ${err.message}`);
      throw new BadRequestException(`Webhook error: ${err.message}`);
    }
    */
  }

  private async handleFailedPayment(
    paymentIntentId: string,
    donationId: string,
  ): Promise<void> {
    this.logger.log(
      `Handling failed payment for intent: ${paymentIntentId} and donation: ${donationId}`,
    );

    // Update donation status to failed
    await this.prisma.donation.update({
      where: { id: donationId },
      data: {
        status: DonationStatus.FAILED,
        transactionId: paymentIntentId,
      },
    });

    // Create payment details
    await this.prisma.paymentDetail.create({
      data: {
        provider: 'STRIPE',
        paymentMethodId: 'pm_failed',
        metadata: { paymentIntent: paymentIntentId, status: 'failed' },
        donationId: donationId,
      },
    });
  }
}
