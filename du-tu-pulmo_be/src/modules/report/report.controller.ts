import { ERROR_MESSAGES } from '@/common/constants/error-messages.constant';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ReportService } from '@/modules/report/report.service';
import { CreateReportDto } from '@/modules/report/dto/create-report.dto';
import { UpdateReportDto } from '@/modules/report/dto/update-report.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportResponseDto } from '@/modules/report/dto/report-response.dto';
import { JwtAuthGuard } from '@/modules/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/core/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/user.decorator';
import type { JwtUser } from '@/modules/core/auth/strategies/jwt.strategy';
import { ResponseCommon } from '@/common/dto/response.dto';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo báo cáo bác sĩ hoặc cuộc hẹn' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ReportResponseDto,
    description: 'Tạo báo cáo thành công',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Request không hợp lệ hoặc đã tồn tại báo cáo tương tự',
  })
  async create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ResponseCommon<ReportResponseDto>> {
    const response = await this.reportService.create(
      createReportDto,
      user.userId,
    );
    return new ResponseCommon(
      response.code,
      response.message,
      ReportResponseDto.fromEntity(response.data!),
    );
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy tất cả báo cáo (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: [ReportResponseDto] })
  async findAll(): Promise<ResponseCommon<ReportResponseDto[]>> {
    const response = await this.reportService.findAll();
    const data = (response.data ?? []).map((report) =>
      ReportResponseDto.fromEntity(report),
    );
    return new ResponseCommon(response.code, response.message, data);
  }

  @Get('my-reports')
  @ApiOperation({ summary: 'Lấy danh sách báo cáo của tôi' })
  @ApiResponse({ status: HttpStatus.OK, type: [ReportResponseDto] })
  async findMyReports(
    @CurrentUser() user: JwtUser,
  ): Promise<ResponseCommon<ReportResponseDto[]>> {
    const response = await this.reportService.findByReporter(user.userId);
    const data = (response.data ?? []).map((report) =>
      ReportResponseDto.fromEntity(report),
    );
    return new ResponseCommon(response.code, response.message, data);
  }

  @Get('doctor/:doctorId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách báo cáo về bác sĩ (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: [ReportResponseDto] })
  async findByDoctor(
    @Param('doctorId') doctorId: string,
  ): Promise<ResponseCommon<ReportResponseDto[]>> {
    const response = await this.reportService.findByDoctor(doctorId);
    const data = (response.data ?? []).map((report) =>
      ReportResponseDto.fromEntity(report),
    );
    return new ResponseCommon(response.code, response.message, data);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết báo cáo (chỉ Admin hoặc người tạo báo cáo)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ReportResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy báo cáo',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Không có quyền truy cập',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
  ): Promise<ResponseCommon<ReportResponseDto>> {
    const response = await this.reportService.findOne(id);

    if (
      !user.roles?.includes('ADMIN') &&
      response.data?.reporterId !== user.userId
    ) {
      throw new ForbiddenException(ERROR_MESSAGES.ACCESS_DENIED);
    }

    return new ResponseCommon(
      response.code,
      response.message,
      ReportResponseDto.fromEntity(response.data!),
    );
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật trạng thái báo cáo (Admin)' })
  @ApiResponse({ status: HttpStatus.OK, type: ReportResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() user: JwtUser,
  ): Promise<ResponseCommon<ReportResponseDto>> {
    const response = await this.reportService.update(
      id,
      updateReportDto,
      user.userId,
    );
    return new ResponseCommon(
      response.code,
      response.message,
      ReportResponseDto.fromEntity(response.data!),
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa báo cáo (Admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa báo cáo thành công',
  })
  remove(@Param('id') id: string): Promise<ResponseCommon<null>> {
    return this.reportService.remove(id);
  }
}
