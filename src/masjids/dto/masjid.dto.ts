import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class MasjidResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Al-Aqsa Masjid' })
  name: string;

  @ApiPropertyOptional({
    example: 'A beautiful masjid serving the local community',
  })
  description: string | null;

  @ApiProperty({ example: '123 Main St' })
  address: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiProperty({ example: 'USA' })
  country: string;

  @ApiProperty({ example: '10001' })
  zipCode: string;

  @ApiPropertyOptional({ example: 'info@alaqsamasjid.org' })
  email: string | null;

  @ApiPropertyOptional({ example: '+1234567890' })
  phone: string | null;

  @ApiPropertyOptional({ example: 'https://alaqsamasjid.org' })
  website: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  logoUrl: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  coverImageUrl: string | null;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: true })
  isVerified: boolean;
}

export class CreateMasjidDto {
  @ApiProperty({ example: 'Al-Aqsa Masjid' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'A beautiful masjid serving the local community',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  zipCode: string;

  @ApiPropertyOptional({ example: 'info@alaqsamasjid.org' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://alaqsamasjid.org' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;
}

export class UpdateMasjidDto {
  @ApiPropertyOptional({ example: 'Al-Aqsa Masjid' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'A beautiful masjid serving the local community',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'New York' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'NY' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: '10001' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ example: 'info@alaqsamasjid.org' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://alaqsamasjid.org' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}

export class MasjidAdminResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  masjidId: string;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CreateMasjidAdminDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsString()
  @IsOptional()
  role?: string;
}

export class UpdateMasjidAdminDto {
  @ApiPropertyOptional({ example: 'ADMIN' })
  @IsString()
  @IsOptional()
  role?: string;
}
