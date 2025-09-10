// src/modules/betting-receipt/dtos/create-betting-receipt.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsArray, 
  IsNumber, 
  IsOptional, 
  ValidateNested, 
  IsEnum,
  Min,
  ArrayMinSize
} from 'class-validator';
import { Type } from 'class-transformer';
import { generateResponse } from '@/common/utils/response.util';
import { BettingReceipt } from '../schemas/betting-receipt.schema';

// 베팅 배당률 정보 DTO
export class GameBetRtDto {
  @ApiProperty({ example: '1.06', description: '홈팀 배당률' })
  @IsOptional()
  @IsString()
  h_rt?: string;

  @ApiProperty({ example: '-', description: '무승부 배당률' })
  @IsOptional()
  @IsString()
  d_rt?: string;

  @ApiProperty({ example: '4.85', description: '원정팀 배당률' })
  @IsOptional()
  @IsString()
  a_rt?: string;

  @ApiProperty({ example: 'u', description: '홈팀 배당률 증감' })
  @IsOptional()
  @IsString()
  h_ud?: string;

  @ApiProperty({ example: '', description: '무승부 배당률 증감' })
  @IsOptional()
  @IsString()
  d_ud?: string;

  @ApiProperty({ example: 'd', description: '원정팀 배당률 증감' })
  @IsOptional()
  @IsString()
  a_ud?: string;

  @ApiProperty({ example: '81', description: '홈팀 예상 확률' })
  @IsOptional()
  @IsString()
  h_e_p?: string;

  @ApiProperty({ example: '19', description: '원정팀 예상 확률' })
  @IsOptional()
  @IsString()
  a_e_p?: string;

  @ApiProperty({ example: 'Y', description: '히스토리 존재 영부' })
  @IsOptional()
  @IsString()
  history_yn?: string;
}

// 게임 정보 DTO
export class GameInfoDto {
  @ApiProperty({ example: 'OT2025331103238', description: '게임 ID' })
  @IsString()
  game_id: string;

  @ApiProperty({ 
    example: 'basketball', 
    description: '스포츠 종목',
    enum: ['basketball', 'baseball', 'football', 'soccer']
  })
  @IsString()
  compe: string;

  @ApiProperty({ example: 'OT331', description: '리그 ID', required: false })
  @IsOptional()
  @IsString()
  league_id?: string;

  @ApiProperty({ example: '유로바스켓', description: '리그명' })
  @IsString()
  league_name: string;

  @ApiProperty({ example: '2025-09-11', description: '경기 날짜 (YYYY-MM-DD)' })
  @IsString()
  match_date: string;

  @ApiProperty({ example: '03:00', description: '경기 시간 (HH:MM)' })
  @IsString()
  match_time: string;

  @ApiProperty({ example: 'OT31158', description: '홈팀 ID', required: false })
  @IsOptional()
  @IsString()
  home_team_id?: string;

  @ApiProperty({ example: '독일', description: '홈팀명' })
  @IsString()
  home_team_name: string;

  @ApiProperty({ example: 'OT31143', description: '원정팀 ID', required: false })
  @IsOptional()
  @IsString()
  away_team_id?: string;

  @ApiProperty({ example: '슬로베니아', description: '원정팀명' })
  @IsString()
  away_team_name: string;

  @ApiProperty({ example: '0', description: '홈팀 점수', required: false })
  @IsOptional()
  @IsString()
  home_score?: string;

  @ApiProperty({ example: '0', description: '원정팀 점수', required: false })
  @IsOptional()
  @IsString()
  away_score?: string;

  @ApiProperty({ 
    example: 'before', 
    description: '경기 상태',
    enum: ['before', 'playing', 'finish', 'cancelled'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['before', 'playing', 'finish', 'cancelled'])
  state?: string;

  @ApiProperty({ example: '경기전', description: '경기 상태 텍스트', required: false })
  @IsOptional()
  @IsString()
  state_txt?: string;

  @ApiProperty({ example: '-11.5', description: '핸디캡 점수', required: false })
  @IsOptional()
  @IsString()
  handicap_score_cn?: string;

  @ApiProperty({ example: '1.71', description: '홈팀 베팅 배당률', required: false })
  @IsOptional()
  @IsString()
  home_bet_rt?: string;

  @ApiProperty({ example: '1.77', description: '원정팀 베팅 배당률', required: false })
  @IsOptional()
  @IsString()
  away_bet_rt?: string;

  @ApiProperty({ description: '베팅 배당률 상세 정보', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => GameBetRtDto)
  bet_rt?: GameBetRtDto;

  @ApiProperty({ example: '107', description: '라운드 번호', required: false })
  @IsOptional()
  @IsString()
  round_no?: string;

  @ApiProperty({ example: '006', description: '게임 번호', required: false })
  @IsOptional()
  @IsString()
  game_no?: string;
}

// 베팅 항목 DTO
export class BettingItemDto {
  @ApiProperty({ example: 'OT2025331103238', description: '게임 ID' })
  @IsString()
  game_id: string;

  @ApiProperty({ 
    example: 'home', 
    description: '베팅 타입',
    enum: ['home', 'away', 'draw', 'handicap', 'over', 'under']
  })
  @IsEnum(['home', 'away', 'draw', 'handicap', 'over', 'under'])
  betting_type: string;

  @ApiProperty({ example: '독일', description: '베팅한 팀명' })
  @IsString()
  selected_team: string;

  @ApiProperty({ example: '1.06', description: '베팅 배당률' })
  @IsString()
  odds: string;

  @ApiProperty({ example: 10000, description: '베팅 금액 (원)' })
  @IsNumber()
  @Min(1000)
  betting_amount: number;

  @ApiProperty({ example: 10600, description: '예상 당첨 금액 (원)' })
  @IsNumber()
  @Min(0)
  expected_payout: number;
}

// 메인 생성 DTO
export class CreateBettingReceiptDto {
  @ApiProperty({ example: 'A1qUCFO+ct1+XUV+7gqvpw==', description: '사용자 번호' })
  @IsString()
  user_no: string;

  @ApiProperty({ description: '선택된 게임 목록' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GameInfoDto)
  selected_games: GameInfoDto[];

  @ApiProperty({ description: '베팅 항목 목록' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BettingItemDto)
  betting_items: BettingItemDto[];

  @ApiProperty({ example: 50000, description: '총 베팅 금액 (원)' })
  @IsNumber()
  @Min(1000)
  total_betting_amount: number;

  @ApiProperty({ example: 125000, description: '총 예상 당첨 금액 (원)' })
  @IsNumber()
  @Min(0)
  total_expected_payout: number;

  @ApiProperty({ example: '2.5', description: '전체 배당률' })
  @IsString()
  total_odds: string;

  @ApiProperty({ 
    example: 'proto', 
    description: '베팅 타입 (proto/real)',
    enum: ['proto', 'real'],
    required: false
  })
  @IsOptional()
  @IsEnum(['proto', 'real'])
  betting_type?: string;
}

// 업데이트 DTO
export class UpdateBettingReceiptDto {
  @ApiProperty({ 
    example: 'won', 
    description: '베팅 상태',
    enum: ['pending', 'won', 'lost', 'cancelled'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['pending', 'won', 'lost', 'cancelled'])
  status?: string;
}

// 응답 DTO
export class CreateBettingReceiptResponse extends generateResponse(BettingReceipt) {}
export class UpdateBettingReceiptResponse extends generateResponse(BettingReceipt) {}

// 리스트 조회 필터 DTO
export class BettingReceiptFilterDto {
  @ApiProperty({ example: 'A1qUCFO+ct1+XUV+7gqvpw==', description: '사용자 번호', required: false })
  @IsOptional()
  @IsString()
  user_no?: string;

  @ApiProperty({ 
    example: 'pending', 
    description: '베팅 상태',
    enum: ['pending', 'won', 'lost', 'cancelled'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['pending', 'won', 'lost', 'cancelled'])
  status?: string;

  @ApiProperty({ 
    example: 'proto', 
    description: '베팅 타입',
    enum: ['proto', 'real'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['proto', 'real'])
  betting_type?: string;

  @ApiProperty({ example: '2025-09-11', description: '시작 날짜 (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  start_date?: string;

  @ApiProperty({ example: '2025-09-11', description: '종료 날짜 (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  end_date?: string;
}