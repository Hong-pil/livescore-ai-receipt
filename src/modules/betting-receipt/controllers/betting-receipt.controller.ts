// src/modules/betting-receipt/controllers/betting-receipt.controller.ts
// 1. 필요한 도구들 가져오기 (import)
    // [HTTP 메서드와 용도]
        // @Get()     // 조회 (Read)
        // @Post()    // 생성 (Create)
        // @Put()     // 전체 수정 (Update)
        // @Patch()   // 부분 수정 (Partial Update)
        // @Delete()  // 삭제 (Delete)
    // [데이터 받는 방법]
        // @Body()    // 요청 본문 (POST, PUT에서 주로 사용)
        // @Param()   // URL 경로 변수 (/users/:id의 :id)
        // @Query()   // URL 쿼리 (?page=1&limit=10)
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
// 2. 컨트롤러 클래스 정의
@Controller('api/v1/betting-receipts')  // 주소 설정
export class BettingReceiptController {

  // 3. 생성자 (Service 주입) NestJS가 자동으로 Service 객체를 넣어줌!
  constructor(private readonly bettingReceiptService: BettingReceiptService) { }

  // 4. 메서드들 (각 API 앤드포인트)
  @Post()
  @HttpCode(HttpStatus.CREATED) // 성공하면 201 Created 상태 코드 반환 (HTTP 표준에서 "새로운 리소스 생성 성공"은 201)
  // Swagger 문서화
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
  // @Body() - 요청 본문 받기
  // createBettingReceiptDto(가져온 데이터를 담을 변수) : CreateBettingReceiptDto(데이터 타입 (DTO 클래스))
  async create(@Body() createBettingReceiptDto: CreateBettingReceiptDto): Promise<BettingReceipt> {
    // 1. Service의 create 메서드 호출
    // 2. await: 저장이 완료될 때까지 기다림
    // 3. return: 결과를 앱에게 돌려줌
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
  // 세 가지 다른 방식으로 쿼리를 받고 있다.
  // 예시) GET http://175.126.95.157:4013/api/v1/betting-receipts?user_no=A1qUCFO&status=pending&page=2&limit=20
      // ?user_no=A1qUCFO     ← filterDto에 포함
      // &status=pending      ← filterDto에 포함
      // &page=2              ← page 변수로 따로 받음
      // &limit=20            ← limit 변수로 따로 받음
  // 나눠서 받는 이유는?
  // 이유1 : 역할이 다르다.
      // filterDto: 필터링 조건 (검색 조건 -> "user_no가 A1qUCFO이고, status가 pending인 것만 찾아줘")
      // page, limit: 페이지네이션 (몇 개씩, 몇 페이지 -> "한 페이지에 20개씩, 2페이지 보여줘")
  // 이유2 : 타입 변환이 필요하다.
      // filterDto: 모두 문자열로 받음
      // page, limit: 숫자로 변환 필요
  async findAll(
    @Query() filterDto: BettingReceiptFilterDto,                            // 전체 쿼리
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,     // 특정 쿼리
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,  // 특정 쿼리
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

  // 요청 URL 예시 : GET http://서버:4013/api/v1/betting-receipts/RECEIPT_20251013140530123
  // /betting-receipts/ABC123 → receiptId = "ABC123"
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

  // 요청 URL 예시 : 
  // PUT http://서버:4013/api/v1/betting-receipts/RECEIPT_123
  // Body: {
  //   "status": "won"
  // }
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
  @HttpCode(HttpStatus.NO_CONTENT)  // 삭제 성공 시 204 No Content 반환 (의미: "성공했지만 돌려줄 데이터는 없어요") (Promise<void>)
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