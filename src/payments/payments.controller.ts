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
  Headers,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDetailDto,
  UpdatePaymentDetailDto,
  PaymentDetailResponseDto,
  CreatePaymentIntentDto,
  PaymentIntentResponseDto,
} from './dto/payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // PAYMENT DETAILS ENDPOINTS
  @ApiOperation({ summary: 'Get all payment details' })
  @ApiResponse({
    status: 200,
    description: 'List of all payment details',
    type: [PaymentDetailResponseDto],
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('details')
  async findAllDetails() {
    return this.paymentsService.findAllPaymentDetails();
  }

  @ApiOperation({ summary: 'Get a payment detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'The payment detail',
    type: PaymentDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment detail not found' })
  @ApiParam({ name: 'id', description: 'Payment Detail ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('details/:id')
  async findOneDetail(@Param('id') id: string) {
    return this.paymentsService.findPaymentDetailById(id);
  }

  @ApiOperation({ summary: 'Get payment details by donation ID' })
  @ApiResponse({
    status: 200,
    description: 'The payment detail',
    type: PaymentDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment detail not found' })
  @ApiParam({ name: 'donationId', description: 'Donation ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('details/donation/:donationId')
  async findByDonation(
    @Param('donationId') donationId: string,
    @Request() req,
  ) {
    // TODO: Add proper access control check here
    return this.paymentsService.findPaymentDetailByDonationId(donationId);
  }

  @ApiOperation({ summary: 'Create a payment detail' })
  @ApiResponse({
    status: 201,
    description: 'The payment detail has been created',
    type: PaymentDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('details')
  async createDetail(@Body() createPaymentDetailDto: CreatePaymentDetailDto) {
    return this.paymentsService.createPaymentDetail(createPaymentDetailDto);
  }

  @ApiOperation({ summary: 'Update a payment detail' })
  @ApiResponse({
    status: 200,
    description: 'The payment detail has been updated',
    type: PaymentDetailResponseDto,
  })
  @ApiParam({ name: 'id', description: 'Payment Detail ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch('details/:id')
  async updateDetail(
    @Param('id') id: string,
    @Body() updatePaymentDetailDto: UpdatePaymentDetailDto,
  ) {
    return this.paymentsService.updatePaymentDetail(id, updatePaymentDetailDto);
  }

  @ApiOperation({ summary: 'Delete a payment detail' })
  @ApiResponse({
    status: 204,
    description: 'The payment detail has been deleted',
  })
  @ApiParam({ name: 'id', description: 'Payment Detail ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete('details/:id')
  async removeDetail(@Param('id') id: string) {
    await this.paymentsService.removePaymentDetail(id);
    return { message: 'Payment detail deleted successfully' };
  }

  // PAYMENT INTENT ENDPOINTS
  @ApiOperation({ summary: 'Create a payment intent' })
  @ApiResponse({
    status: 201,
    description: 'The payment intent has been created',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Public()
  @Post('create-intent')
  async createIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req,
  ) {
    const userId = req.user?.id;
    return this.paymentsService.createPaymentIntent(
      createPaymentIntentDto,
      userId,
    );
  }

  @ApiOperation({ summary: 'Confirm a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'The payment intent has been confirmed',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiParam({ name: 'paymentIntentId', description: 'Payment Intent ID' })
  @ApiParam({ name: 'donationId', description: 'Donation ID' })
  @Public()
  @Post('confirm-intent/:paymentIntentId/:donationId')
  async confirmIntent(
    @Param('paymentIntentId') paymentIntentId: string,
    @Param('donationId') donationId: string,
  ) {
    await this.paymentsService.confirmPaymentIntent(
      paymentIntentId,
      donationId,
    );
    return { success: true };
  }

  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
  })
  @ApiBody({
    description: 'Raw webhook body from Stripe',
    type: Object,
  })
  @Public()
  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Pass the raw body to the service
    await this.paymentsService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
