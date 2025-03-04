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
  Query,
  DefaultValuePipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  CreateDonationDto,
  DonationResponseDto,
} from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // CAMPAIGN ENDPOINTS
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({
    status: 200,
    description: 'List of all campaigns',
    type: [CampaignResponseDto],
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Filter to only active campaigns',
  })
  @Public()
  @Get()
  async findAll(
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
  ) {
    return this.campaignsService.findAllCampaigns(activeOnly);
  }

  @ApiOperation({ summary: 'Get campaigns by masjid' })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns for the masjid',
    type: [CampaignResponseDto],
  })
  @ApiParam({ name: 'masjidId', description: 'Masjid ID' })
  @Public()
  @Get('masjid/:masjidId')
  async findByMasjid(@Param('masjidId') masjidId: string) {
    return this.campaignsService.findCampaignsByMasjid(masjidId);
  }

  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiResponse({
    status: 200,
    description: 'The campaign',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findCampaignById(id);
  }

  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({
    status: 201,
    description: 'The campaign has been created',
    type: CampaignResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createCampaignDto: CreateCampaignDto, @Request() req) {
    return this.campaignsService.createCampaign(createCampaignDto, req.user.id);
  }

  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({
    status: 200,
    description: 'The campaign has been updated',
    type: CampaignResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Request() req,
  ) {
    return this.campaignsService.updateCampaign(
      id,
      updateCampaignDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiResponse({ status: 204, description: 'The campaign has been deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden resource' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.campaignsService.removeCampaign(id, req.user.id);
    return { message: 'Campaign deleted successfully' };
  }

  // DONATION ENDPOINTS
  @ApiOperation({ summary: 'Get all donations for a campaign' })
  @ApiResponse({
    status: 200,
    description: 'List of donations for the campaign',
    type: [DonationResponseDto],
  })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':campaignId/donations')
  async findDonations(@Param('campaignId') campaignId: string, @Request() req) {
    const campaign = await this.campaignsService.findCampaignById(campaignId);

    // TODO: Implement proper access control for who can view donations
    // For now, we'll just return all donations for the campaign
    return this.campaignsService.findDonationsByCampaign(campaignId);
  }

  @ApiOperation({ summary: 'Create a donation for a campaign' })
  @ApiResponse({
    status: 201,
    description: 'The donation has been created',
    type: DonationResponseDto,
  })
  @ApiParam({ name: 'campaignId', description: 'Campaign ID' })
  @Post(':campaignId/donations')
  async createDonation(
    @Param('campaignId') campaignId: string,
    @Body() createDonationDto: CreateDonationDto,
    @Request() req,
  ) {
    // Set campaignId from URL parameter
    createDonationDto.campaignId = campaignId;

    // Get userId if authenticated
    const userId = req.user?.id;

    return this.campaignsService.createDonation(createDonationDto, userId);
  }
}
