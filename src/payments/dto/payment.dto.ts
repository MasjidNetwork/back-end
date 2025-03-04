import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  IsOptional,
  IsUUID,
  IsUrl,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentDetailResponseDto {
  @ApiProperty({ description: 'Unique identifier for the payment details' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Payment provider (e.g. STRIPE, PAYPAL)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Payment method ID from provider' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @ApiProperty({ description: 'URL to receipt/invoice' })
  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @ApiProperty({ description: 'Additional provider-specific data' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'ID of the related donation' })
  @IsUUID()
  donationId: string;

  @ApiProperty({ description: 'When the payment details were created' })
  @IsString()
  createdAt: Date;

  @ApiProperty({ description: 'When the payment details were last updated' })
  @IsString()
  updatedAt: Date;
}

export class CreatePaymentDetailDto {
  @ApiProperty({ description: 'Payment provider (e.g. STRIPE, PAYPAL)' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Payment method ID from provider' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;

  @ApiProperty({ description: 'URL to receipt/invoice' })
  @IsUrl()
  @IsOptional()
  receiptUrl?: string;

  @ApiProperty({ description: 'Additional provider-specific data' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'ID of the related donation' })
  @IsUUID()
  donationId: string;
}

export class UpdatePaymentDetailDto extends PartialType(
  CreatePaymentDetailDto,
) {}

// Payment Intent DTO for Stripe integration
export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Amount to process (in cents)' })
  @IsDecimal()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Currency code (e.g. USD)' })
  @IsString()
  currency: string = 'USD';

  @ApiProperty({ description: 'Payment method to use' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'ID of the campaign to donate to' })
  @IsUUID()
  campaignId: string;

  @ApiProperty({ description: 'Whether the donation should be anonymous' })
  @IsOptional()
  isAnonymous?: boolean = false;

  @ApiProperty({ description: 'Optional message to include with donation' })
  @IsString()
  @IsOptional()
  message?: string;
}

export class PaymentIntentResponseDto {
  @ApiProperty({ description: 'Client secret for Stripe payment intent' })
  @IsString()
  clientSecret: string;

  @ApiProperty({ description: 'Payment intent ID' })
  @IsString()
  paymentIntentId: string;

  @ApiProperty({ description: 'Temporary donation ID' })
  @IsUUID()
  donationId: string;
}
