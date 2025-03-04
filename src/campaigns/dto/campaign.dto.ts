import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
  IsDecimal,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DonationStatus } from '@prisma/client';

export class CampaignResponseDto {
  @ApiProperty({ description: 'Unique identifier for the campaign' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Title of the campaign' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Description of the campaign' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Funding goal amount for the campaign' })
  @IsDecimal()
  goal: number;

  @ApiProperty({ description: 'Current amount raised for the campaign' })
  @IsDecimal()
  raised: number;

  @ApiProperty({ description: 'Start date of the campaign' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'End date of the campaign (optional)' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Whether the campaign is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Cover image URL for the campaign' })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ description: 'ID of the masjid running the campaign' })
  @IsUUID()
  masjidId: string;

  @ApiProperty({ description: 'When the campaign was created' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'When the campaign was last updated' })
  @IsDateString()
  updatedAt: Date;
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Title of the campaign' })
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Description of the campaign' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Funding goal amount for the campaign' })
  @IsDecimal()
  @Type(() => Number)
  goal: number;

  @ApiProperty({ description: 'Start date of the campaign' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'End date of the campaign (optional)' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiProperty({ description: 'Whether the campaign is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @ApiProperty({ description: 'Cover image URL for the campaign' })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({ description: 'ID of the masjid running the campaign' })
  @IsUUID()
  masjidId: string;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

// DTOs for donations
export class DonationResponseDto {
  @ApiProperty({ description: 'Unique identifier for the donation' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Amount donated' })
  @IsDecimal()
  amount: number;

  @ApiProperty({ description: 'Payment method used' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Transaction ID from payment provider' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({
    description: 'Status of the donation',
    enum: DonationStatus,
  })
  status: DonationStatus;

  @ApiProperty({ description: 'Whether the donation is anonymous' })
  @IsBoolean()
  isAnonymous: boolean;

  @ApiProperty({ description: 'Optional message from donor' })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiProperty({ description: 'ID of the user who made the donation' })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'ID of the campaign for this donation' })
  @IsUUID()
  campaignId: string;

  @ApiProperty({ description: 'When the donation was created' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'When the donation was last updated' })
  @IsDateString()
  updatedAt: Date;
}

export class CreateDonationDto {
  @ApiProperty({ description: 'Amount to donate' })
  @IsDecimal()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Payment method to use' })
  @IsString()
  paymentMethod: string;

  @ApiProperty({ description: 'Whether the donation should be anonymous' })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean = false;

  @ApiProperty({ description: 'Optional message to include with donation' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;

  @ApiProperty({ description: 'ID of the campaign to donate to' })
  @IsUUID()
  campaignId: string;
}

export class UpdateDonationDto extends PartialType(CreateDonationDto) {
  @ApiProperty({
    description: 'Status of the donation',
    enum: DonationStatus,
  })
  @IsOptional()
  status?: DonationStatus;

  @ApiProperty({ description: 'Transaction ID from payment provider' })
  @IsString()
  @IsOptional()
  transactionId?: string;
}
