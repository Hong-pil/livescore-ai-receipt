// src/modules/betting-receipt/controllers/betting-receipt.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { BettingReceiptService } from '../services/betting-receipt.service';
import {
  CreateBettingReceiptDto,
  UpdateBettingReceiptDto,
  BettingReceiptFilterDto,
  CreateBettingReceiptResponse,
  UpdateBettingReceiptResponse,
} from '../dtos/create-betting-receipt.dto';
import { BettingReceipt } from '../schemas/betting-receipt.schema';

@ApiTags('프로토 배팅 영수증')
@Controller('api/v1/betting-receipts')
export class BettingReceiptController {
  constructor(private readonly bettingReceiptService: BettingReceiptService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '프로토 배팅 영수증 생성',
    description: '사용자의 프로토 베팅 정보를 저장하여 가상 영수증을 생성합니다.'
  })
  @ApiBody({ type: CreateBettingReceiptDto })
  @ApiResponse({
    status: 201,
    description: '영수증이 성공적으로 생성되었습니다.',
    type: CreateBettingReceiptResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
  @ApiResponse({ status: 409, description: '이미 존재하는 영수증 ID입니다.' })
  async create(@Body() createBettingReceiptDto: CreateBettingReceiptDto): Promise<BettingReceipt> {
    return await this.bettingReceiptService.create(createBettingReceiptDto);
  }

  @Get()
  @ApiOperation({ 
    summary: '베팅 영수증 목록 조회',
    description: '필터링 옵션과 페이징을 통해 베팅 영수증 목록을 조회합니다.'
  })
  @ApiQuery({ name: 'user_no', required: false, description: '사용자 번호' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'won', 'lost', 'cancelled'], description: '베팅 상태' })
  @ApiQuery({ name: 'betting_type', required: false, enum: ['proto', 'real'], description: '베팅 타입' })
  @ApiQuery({ name: 'start_date', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수 (기본값: 10)' })
  @ApiResponse({ status: 200, description: '영수증 목록 조회 성공' })
  async findAll(
    @Query() filterDto: BettingReceiptFilterDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.bettingReceiptService.findAll(filterDto, page, limit);
  }

  @Get('user/:userNo')
  @ApiOperation({ 
    summary: '특정 사용자의 베팅 영수증 조회',
    description: '특정 사용자의 모든 베팅 영수증을 페이징하여 조회합니다.'
  })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호 (기본값: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 항목 수 (기본값: 10)' })
  @ApiResponse({ status: 200, description: '사용자 영수증 목록 조회 성공' })
  async findByUser(
    @Param('userNo') userNo: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.bettingReceiptService.findByUser(userNo, page, limit);
  }

  @Get('stats/user/:userNo')
  @ApiOperation({ 
    summary: '사용자 베팅 통계 조회',
    description: '특정 사용자의 베팅 통계 정보를 조회합니다.'
  })
  @ApiParam({ name: 'userNo', description: '사용자 번호' })
  @ApiResponse({ status: 200, description: '사용자 베팅 통계 조회 성공' })
  async getUserStats(@Param('userNo') userNo: string) {
    return await this.bettingReceiptService.getUserBettingStats(userNo);
  }

  @Get('stats/daily')
  @ApiOperation({ 
    summary: '일별 베팅 통계 조회',
    description: '지정된 기간의 일별 베팅 통계를 조회합니다.'
  })
  @ApiQuery({ name: 'start_date', description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', description: '종료 날짜 (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: '일별 베팅 통계 조회 성공' })
  async getDailyStats(
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return await this.bettingReceiptService.getDailyBettingStats(startDate, endDate);
  }

  @Get(':receiptId')
  @ApiOperation({ 
    summary: '베팅 영수증 상세 조회',
    description: '영수증 ID로 특정 베팅 영수증의 상세 정보를 조회합니다.'
  })
  @ApiParam({ name: 'receiptId', description: '영수증 ID' })
  @ApiResponse({ status: 200, description: '영수증 상세 조회 성공' })
  @ApiResponse({ status: 404, description: '영수증을 찾을 수 없습니다.' })
  async findOne(@Param('receiptId') receiptId: string): Promise<BettingReceipt> {
    return await this.bettingReceiptService.findOne(receiptId);
  }

  @Put(':receiptId')
  @ApiOperation({ 
    summary: '베팅 영수증 상태 업데이트',
    description: '베팅 결과에 따라 영수증의 상태를 업데이트합니다.'
  })
  @ApiParam({ name: 'receiptId', description: '영수증 ID' })
  @ApiBody({ type: UpdateBettingReceiptDto })
  @ApiResponse({
    status: 200,
    description: '영수증이 성공적으로 업데이트되었습니다.',
    type: UpdateBettingReceiptResponse,
  })
  @ApiResponse({ status: 404, description: '영수증을 찾을 수 없습니다.' })
  async update(
    @Param('receiptId') receiptId: string,
    @Body() updateBettingReceiptDto: UpdateBettingReceiptDto,
  ): Promise<BettingReceipt> {
    return await this.bettingReceiptService.update(receiptId, updateBettingReceiptDto);
  }

  @Delete(':receiptId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: '베팅 영수증 삭제',
    description: '지정된 베팅 영수증을 삭제합니다.'
  })
  @ApiParam({ name: 'receiptId', description: '영수증 ID' })
  @ApiResponse({ status: 204, description: '영수증이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '영수증을 찾을 수 없습니다.' })
  async remove(@Param('receiptId') receiptId: string): Promise<void> {
    return await this.bettingReceiptService.remove(receiptId);
  }
}