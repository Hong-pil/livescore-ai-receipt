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
  ArrayMinSize,
  IsObject,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';
import { generateResponse } from '@/common/utils/response.util';
import { BettingReceipt } from '../schemas/betting-receipt.schema';

// ==================== 3. RoundInfo DTO ====================
export class RoundInfoDto {
  @ApiProperty({ example: '385066000', description: '1등 적중예상금', required: false })
  @IsOptional()
  @IsString()
  tot_exp_hit_amt?: string;

  @ApiProperty({ example: '1540264000', description: '총 발매금액', required: false })
  @IsOptional()
  @IsString()
  tot_sale_amt?: string;

  @ApiProperty({ example: '0', description: '이월 금액(전회차)', required: false })
  @IsOptional()
  @IsString()
  tot_over_amt?: string;

  @ApiProperty({ example: '0', description: '이월 횟수(전회차)', required: false})
  @IsOptional()
  @IsString()
  tot_over_cnt?: string;

  @ApiProperty({ example: '0', description: '1등 적중수', required: false})
  @IsOptional()
  @IsString()
  rank1_hit_amt?: string;

  @ApiProperty({ example: '0', description: '1등 개별환급금액(세전)', required: false})
  @IsOptional()
  @IsString()
  rank1_indv_refund_amt?: string;

  @ApiProperty({ example: '0', description: '1등 개별환급금액(세후)', required: false})
  @IsOptional()
  @IsString()
  rank1_indv_refund_amt_tax?: string;

  @ApiProperty({ example: '0', description: '1등 이월 금액(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank1_over_amt?: string;

  @ApiProperty({ example: '0', description: '1등 이월 횟수(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank1_over_cnt?: string;

  @ApiProperty({ example: '0', description: '2등 적중수', required: false})
  @IsOptional()
  @IsString()
  rank2_hit_amt?: string;

  @ApiProperty({ example: '0', description: '2등 개별환급금액(세전)', required: false})
  @IsOptional()
  @IsString()
  rank2_indv_refund_amt?: string;

  @ApiProperty({ example: '0', description: '2등 개별환급금액(세후)', required: false})
  @IsOptional()
  @IsString()
  rank2_indv_refund_amt_tax?: string;

  @ApiProperty({ example: '0', description: '2등 이월 금액(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank2_over_amt?: string;

  @ApiProperty({ example: '0', description: '2등 이월 횟수(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank2_over_cnt?: string;

  @ApiProperty({ example: '0', description: '3등 적중수', required: false})
  @IsOptional()
  @IsString()
  rank3_hit_amt?: string;

  @ApiProperty({ example: '0', description: '3등 개별환급금액(세전)', required: false})
  @IsOptional()
  @IsString()
  rank3_indv_refund_amt?: string;

  @ApiProperty({ example: '0', description: '3등 개별환급금액(세후)', required: false})
  @IsOptional()
  @IsString()
  rank3_indv_refund_amt_tax?: string;

  @ApiProperty({ example: '0', description: '3등 이월 금액(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank3_over_amt?: string;

  @ApiProperty({ example: '0', description: '3등 이월 횟수(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank3_over_cnt?: string;

  @ApiProperty({ example: '0', description: '4등 적중수', required: false})
  @IsOptional()
  @IsString()
  rank4_hit_amt?: string;

  @ApiProperty({ example: '0', description: '4등 개별환급금액(세전)', required: false})
  @IsOptional()
  @IsString()
  rank4_indv_refund_amt?: string;

  @ApiProperty({ example: '0', description: '4등 개별환급금액(세후)', required: false})
  @IsOptional()
  @IsString()
  rank4_indv_refund_amt_tax?: string;

  @ApiProperty({ example: '0', description: '4등 이월 금액(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank4_over_amt?: string;

  @ApiProperty({ example: '0', description: '4등 이월 횟수(차회차)', required: false})
  @IsOptional()
  @IsString()
  rank4_over_cnt?: string;
}

// ==================== 1. TotoCalcBookmarkDetailInfo DTO ====================
export class TotoCalcBookmarkDetailDto {
  @ApiProperty({ example: '42', description: '토토 경기 번호' })
  @IsString()
  game_no: string;

  @ApiProperty({ example: 'P20210401074043413', description: '경기 ID' })
  @IsString()
  game_id: string;

  @ApiProperty({ example: '12.05', description: '기준점 (언더오버/핸디캡)', required: false })
  @IsOptional()
  @IsString()
  standard_value?: string;

  @ApiProperty({ example: 'N', description: '발매 불가 경기 여부', required: false })
  @IsOptional()
  @IsString()
  isUnavailableTicketingGame?: string;

  @ApiProperty({ 
    example: 'W',
    description: '예측 결과 (W:승, D:무, L:패, U:언더, O:오버)' 
  })
  @IsString()
  predict_state: string;

  @ApiProperty({ example: '1.65', description: '승 배당률' })
  @IsString()
  w_bet_rt: string;

  @ApiProperty({ example: '3.23', description: '패 배당률' })
  @IsString()
  l_bet_rt: string;

  @ApiProperty({ example: '', description: '무 배당률', required: false })
  @IsOptional()
  @IsString()
  d_bet_rt?: string;

  @ApiProperty({ 
    example: 'U', 
    description: '배팅 타입 (U:언더오버, H:핸디캡, 공백:승무패)',
    required: false 
  })
  @IsOptional()
  @IsString()
  type_sc?: string;
}

// ==================== 2. TotoCalcBookmarkRoundInfo DTO ====================
export class TotoCalcBookmarkRoundInfoDto {
  @ApiProperty({ example: 'P', description: '배당 구분 (P:프로토, F:승부식, A:승5패, B:승1패)' })
  @IsString()
  diviedend_sc: string;

  @ApiProperty({ example: '', description: '계산 번호 (수정 시 사용)', required: false })
  @IsOptional()
  @IsString()
  calc_no?: string;

  @ApiProperty({ example: '107', description: '회차 번호' })
  @IsString()
  round_no: string;

  @ApiProperty({ example: '3', description: '선택한 경기 수' })
  @IsString()
  game_cnt: string;

  @ApiProperty({ example: '1000', description: '배팅액 (원)' })
  @IsString()
  bet_price: string;

  @ApiProperty({ example: 'N', description: '즐겨찾기 여부 (Y/N)', required: false })
  @IsOptional()
  @IsString()
  bookmark_yn?: string;

  @ApiProperty({ example: '5.4', description: '예상 배당률' })
  @IsString()
  predict_bet_rt: string;

  @ApiProperty({ example: '5400', description: '예상 적중금 (원)' })
  @IsString()
  predict_bet_price: string;

  @ApiProperty({ example: '2025-09-11 14:30:00', description: '등록 일시', required: false })
  @IsOptional()
  @IsString()
  reg_date?: string;

  @ApiProperty({ 
    description: '선택한 경기들의 배팅 상세 정보',
    type: [TotoCalcBookmarkDetailDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TotoCalcBookmarkDetailDto)
  bookmarks: TotoCalcBookmarkDetailDto[];

  @ApiProperty({ example: '', description: '전체 맞힘 여부 (Y/N/빈값)', required: false })
  @IsOptional()
  @IsString()
  allCorrectState?: string;
}

// ==================== 4. GameBetRt DTO ====================
// 베팅 배당률 정보 DTO
export class GameBetRtDto {
  // ==================== 국내 배당률 ====================
  @ApiProperty({ example: '1.06', description: '홈팀 배당률', required: false })
  @IsOptional()
  @IsString()
  h_rt?: string;

  @ApiProperty({ example: '3.25', description: '무승부 배당률', required: false })
  @IsOptional()
  @IsString()
  d_rt?: string;

  @ApiProperty({ example: '4.85', description: '원정팀 배당률', required: false })
  @IsOptional()
  @IsString()
  a_rt?: string;

  // ==================== 국내 배당률 증감 ====================
  @ApiProperty({ example: 'u', description: '홈팀 배당률 증감 (u:상승, d:하락, 공백:변동없음)', required: false })
  @IsOptional()
  @IsString()
  h_ud?: string;

  @ApiProperty({ example: '', description: '무승부 배당률 증감', required: false })
  @IsOptional()
  @IsString()
  d_ud?: string;

  @ApiProperty({ example: 'd', description: '원정팀 배당률 증감', required: false })
  @IsOptional()
  @IsString()
  a_ud?: string;

  // ==================== 해외 배당률 ====================
  @ApiProperty({ example: '1.95', description: '해외 홈팀 배당률', required: false })
  @IsOptional()
  @IsString()
  f_h_rt?: string;

  @ApiProperty({ example: '3.40', description: '해외 무승부 배당률', required: false })
  @IsOptional()
  @IsString()
  f_d_rt?: string;

  @ApiProperty({ example: '2.40', description: '해외 원정팀 배당률', required: false })
  @IsOptional()
  @IsString()
  f_a_rt?: string;

  // ==================== 해외 배당률 증감 ====================
  @ApiProperty({ example: 'u', description: '해외 홈팀 배당률 증감', required: false })
  @IsOptional()
  @IsString()
  f_h_ud?: string;

  @ApiProperty({ example: '', description: '해외 무승부 배당률 증감', required: false })
  @IsOptional()
  @IsString()
  f_d_ud?: string;

  @ApiProperty({ example: 'd', description: '해외 원정팀 배당률 증감', required: false })
  @IsOptional()
  @IsString()
  f_a_ud?: string;

  // ==================== 이벤트 예측 정보 ====================
  @ApiProperty({ example: '2', description: '홈팀 이벤트 예측 스코어', required: false })
  @IsOptional()
  @IsString()
  h_e_s?: string;

  @ApiProperty({ example: '1', description: '원정팀 이벤트 예측 스코어', required: false })
  @IsOptional()
  @IsString()
  a_e_s?: string;

  @ApiProperty({ example: '81', description: '홈팀 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  h_e_p?: string;

  @ApiProperty({ example: '10', description: '무승부 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  d_e_p?: string;

  @ApiProperty({ example: '9', description: '원정팀 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  a_e_p?: string;

  // ==================== 핸디캡 답지 예측 퍼센트 ====================
  @ApiProperty({ example: '60', description: '홈팀 핸디캡 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  h_h_p?: string;

  @ApiProperty({ example: '10', description: '무승부 핸디캡 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  d_h_p?: string;

  @ApiProperty({ example: '30', description: '원정팀 핸디캡 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  a_h_p?: string;

  // ==================== 언더오버 답지 예측 퍼센트 ====================
  @ApiProperty({ example: '60', description: '언더 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  h_u_p?: string;

  @ApiProperty({ example: '10', description: '무승부 언더오버 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  d_u_p?: string;

  @ApiProperty({ example: '30', description: '오버 답지 예측 확률(%)', required: false })
  @IsOptional()
  @IsString()
  a_u_p?: string;

  // ==================== 메타 정보 ====================
  @ApiProperty({ 
    example: 'ABC', 
    description: 'type_sc 조합 (A:일반, B:핸디캡, C:언오버, D:승1패) ex) ABC:일반+핸디캡+언오버',
    required: false 
  })
  @IsOptional()
  @IsString()
  ts?: string;

  @ApiProperty({ example: 'Y', description: '배당률 히스토리 존재 여부 (Y/N)', required: false })
  @IsOptional()
  @IsString()
  history_yn?: string;

  // ==================== 판단 플래그 (계산 필드) ====================
  @ApiProperty({ example: true, description: '국내 배당률 유무 판단', required: false })
  @IsOptional()
  hasBetRt?: boolean;

  @ApiProperty({ example: false, description: '해외 배당률 유무 판단', required: false })
  @IsOptional()
  hasFBetRt?: boolean;
}

// ==================== InjTime DTO ====================
// 추가 시간 정보 DTO (축구에서 사용)
export class InjTimeDto {
  @ApiProperty({ 
    example: '3', 
    description: '연장전 추가 시간 (분)',
    required: false 
  })
  @IsOptional()
  @IsString()
  ot_inj_time?: string;

  @ApiProperty({ 
    example: '5', 
    description: '후반전 추가 시간 (분)',
    required: false 
  })
  @IsOptional()
  @IsString()
  a_inj_time?: string;

  @ApiProperty({ 
    example: '2', 
    description: '전반전 추가 시간 (분)',
    required: false 
  })
  @IsOptional()
  @IsString()
  f_inj_time?: string;
}

// ==================== 1. 팀 전적 정보 DTO (야구 A타입에서 사용) ====================
export class TeamRecordDto {
  // ========== 홈팀 시즌 전적 ==========
  @ApiProperty({ 
    example: '45', 
    description: '홈팀 시즌 승수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_s_w?: string;

  @ApiProperty({ 
    example: '32', 
    description: '홈팀 시즌 패수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_s_l?: string;

  @ApiProperty({ 
    example: '8', 
    description: '홈팀 상대팀 전적 승수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_vs_w?: string;

  @ApiProperty({ 
    example: '5', 
    description: '홈팀 상대팀 전적 패수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_vs_l?: string;

  @ApiProperty({ 
    example: '3.45', 
    description: '홈팀 시즌 평균자책점(ERA)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_s_era?: string;

  // ========== 원정팀 시즌 전적 ==========
  @ApiProperty({ 
    example: '38', 
    description: '원정팀 시즌 승수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_s_w?: string;

  @ApiProperty({ 
    example: '40', 
    description: '원정팀 시즌 패수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_s_l?: string;

  @ApiProperty({ 
    example: '5', 
    description: '원정팀 상대팀 전적 승수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_vs_w?: string;

  @ApiProperty({ 
    example: '8', 
    description: '원정팀 상대팀 전적 패수', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_vs_l?: string;

  @ApiProperty({ 
    example: '4.12', 
    description: '원정팀 시즌 평균자책점(ERA)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_s_era?: string;

  // ========== 승리/패전 투수 정보 (한국어) ==========
  @ApiProperty({ 
    example: '김광현', 
    description: '승리투수 이름 (한국어)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_w?: string;

  @ApiProperty({ 
    example: '박세웅', 
    description: '패전투수 이름 (한국어)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_l?: string;

  // ========== 승리/패전 투수 정보 (영문) ==========
  @ApiProperty({ 
    example: 'Kim Kwang-hyun', 
    description: '승리투수 이름 (영문)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_w_en?: string;

  @ApiProperty({ 
    example: 'Park Se-woong', 
    description: '패전투수 이름 (영문)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_l_en?: string;

  // ========== 승리/패전 투수 정보 (일본어) ==========
  @ApiProperty({ 
    example: 'キム・グァンヒョン', 
    description: '승리투수 이름 (일본어)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_w_ja?: string;

  @ApiProperty({ 
    example: 'パク・セウン', 
    description: '패전투수 이름 (일본어)', 
    required: false 
  })
  @IsOptional()
  @IsString()
  game_l_ja?: string;

  // ========== 팀 순위 ==========
  @ApiProperty({ 
    example: '2', 
    description: '홈팀 순위', 
    required: false 
  })
  @IsOptional()
  @IsString()
  h_rank?: string;

  @ApiProperty({ 
    example: '5', 
    description: '원정팀 순위', 
    required: false 
  })
  @IsOptional()
  @IsString()
  a_rank?: string;
}

// ==================== 2. Topfix Type Enum ====================
export enum TopfixType {
  TOP_MOST = 'topMost',    // 최상단 고정
  TOP = 'top',              // 상단 고정
  BOTTOM = 'bottom',        // 하단 고정
  HOT_MATCH = 'hotmatch',   // 핫매치
  TOP_ALL = 'topAll',       // 전체 상단
}

// ==================== 5. Game DTO (원본 Game 모델 전체) ====================
export class GameDto {
  @ApiProperty({ example: '', description: '' })
  @IsOptional()
  @IsBoolean()
  isGameDetail?: boolean;
  
  @ApiProperty({ example: 'OT2025331103238', description: '게임 ID' })
  @IsOptional()
  @IsString()
  game_id?: string;

  @ApiProperty({ 
    example: 'basketball', 
    description: '스포츠 종목',
    enum: ['basketball', 'baseball', 'football', 'soccer', 'volleyball', 'hockey']
  })
  @IsOptional()
  @IsString()
  compe?: string;

  @ApiProperty({ example: '2015', description: '시즌 년도(예 : 2015)', required: false })
  @IsOptional()
  @IsString()
  season_id?: string;

  @ApiProperty({ example: 'OT331', description: '리그 ID', required: false })
  @IsOptional()
  @IsString()
  league_id?: string;

  @ApiProperty({ example: '유로바스켓', description: '리그명' })
  @IsOptional()
  @IsString()
  league_name?: string;

  @ApiProperty({ example: '2025-09-11', description: '경기 날짜 (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  match_date?: string;

  @ApiProperty({ example: '03:00', description: '경기 시간 (HH:MM)' })
  @IsOptional()
  @IsString()
  match_time?: string;

  @ApiProperty({ example: 'OT31158', description: '홈팀 ID', required: false })
  @IsOptional()
  @IsString()
  home_team_id?: string;

  @ApiProperty({ example: '독일', description: '홈팀명' })
  @IsOptional()
  @IsString()
  home_team_name?: string;

  @ApiProperty({ example: 'OT31143', description: '원정팀 ID', required: false })
  @IsOptional()
  @IsString()
  away_team_id?: string;

  @ApiProperty({ example: '슬로베니아', description: '원정팀명' })
  @IsOptional()
  @IsString()
  away_team_name?: string;

  @ApiProperty({ example: '', description: '홈팀 숏네임', required: false })
  @IsOptional()
  @IsString()
  h_short: string;

  @ApiProperty({ example: '', description: '원정팀 숏네임', required: false })
  @IsOptional()
  @IsString()
  a_short: string;

  @ApiProperty({ example: '', description: '리그명 숏네임', required: false })
  @IsOptional()
  @IsString()
  l_short: string;

  @ApiProperty({ example: '', description: '홈팀 국가 코드', required: false })
  @IsOptional()
  @IsString()
  h_c_code: string;

  @ApiProperty({ example: '', description: '원정팀 국가 코드', required: false })
  @IsOptional()
  @IsString()
  a_c_code: string;

  @ApiProperty({ example: '', description: '리그 국가 코드 표시 유무 (Y:표시 N:미표시)', required: false })
  @IsOptional()
  @IsString()
  l_c_yn: string;

  @ApiProperty({ example: '', description: '리그 국가 정보', required: false })
  @IsOptional()
  @IsString()
  l_c_code: string;

  @ApiProperty({ example: '0', description: '홈팀 점수', required: false })
  @IsOptional()
  @IsString()
  home_score?: string;

  @ApiProperty({ example: '0', description: '원정팀 점수', required: false })
  @IsOptional()
  @IsString()
  away_score?: string;

  @ApiProperty({ 
    example: 'I', 
    description: '발매 상태 (I:발매중, B:발매전, F:발매종료, C:취소)',
    required: false 
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '경기전', description: '경기진행 상태 설명', required: false })
  @IsOptional()
  @IsString()
  state_txt?: string;

  @ApiProperty({ example: 'B', description: 'A: 기본 / B: 1vs1형식 점수대신 텍스트 / C: 기록경기 형식 점수대신 텍스트, 상대팀 대신 정보 / D: 채팅방 형식, M:미니게임, G: 광고배너 / E: 이벤트 형식', required: false })
  @IsOptional()
  @IsString()
  game_type?: string;

  @ApiProperty({ example: '', description: 'B, C 타입일 경우 홈팀 점수 위치에 표시되는 정보', required: false })
  @IsOptional()
  @IsString()
  game_info1?: string;

  @ApiProperty({ example: '', description: 'B, C 타입일 경우 원정팀 점수 위치에 표시되는 정보', required: false })
  @IsOptional()
  @IsString()
  game_info2?: string;

  @ApiProperty({ example: '', description: 'C 타입일 경우 상대팀 정보 위치에 표시되는 정보', required: false })
  @IsOptional()
  @IsString()
  game_info3?: string;

  @ApiProperty({ example: '', description: '데이타용 타이틀', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '', description: '데이타용 타이틀 색상', required: false })
  @IsOptional()
  @IsString()
  title_color?: string;

  @ApiProperty({ example: '', description: '중계박스 칼라', required: false })
  @IsOptional()
  @IsString()
  box_color?: string;

  @ApiProperty({ example: '', description: '리그바 색상', required: false })
  @IsOptional()
  @IsString()
  league_bar_color?: string;

  @ApiProperty({ example: '', description: '관심 경기 유무(Y:관심경기, N:비관심경기)', required: false })
  @IsOptional()
  @IsString()
  interest_game?: string;

  @ApiProperty({ example: '', description: '사용자 국가 코드(한국:KR, 미국:US 등)', required: false })
  @IsOptional()
  @IsString()
  country_code?: string;

  @ApiProperty({ example: '', description: '승 응원글 수(홈팀)', required: false })
  @IsOptional()
  @IsString()
  winCnt?: string;

  @ApiProperty({ example: '', description: '무 응원글 수(팀아이디 0)', required: false })
  @IsOptional()
  @IsString()
  drawCnt?: string;

  @ApiProperty({ example: '', description: '패 응원글 수(원정팀)', required: false })
  @IsOptional()
  @IsString()
  loseCnt?: string;

  @ApiProperty({ example: '', description: '동영상 존재 유무(Y:존재, N:미존재)', required: false })
  @IsOptional()
  @IsString()
  vod_use_flag?: string;

  @ApiProperty({ example: '', description: '동영상 타입(1:일반동영상-웹뷰, 2:라이브동영상-웹뷰, 3:일반동영상-브라우저타입, 4:라이브동영상-브라우저타입, 5:유튜브, 6:아프리카Tv, 7:U+프로야구, 8:트위치, 9:팝업-웹뷰)', required: false })
  @IsOptional()
  @IsString()
  vod_type?: string;

  @ApiProperty({ example: '', description: '전문가 분석 유무(P:분석이 존재하고 유료분석인 경우, F:분석이 존재하고 무료분석인 경우, U:분석이 존재하고 무료분석이고 분석이 수정된 경우, N:미존재, S:분석글 등록 예정)', required: false })
  @IsOptional()
  @IsString()
  analysis_use_flag?: string;

  @ApiProperty({ example: '', description: '배팅 유무 및 회원별 배팅 상태값(1:회색(미제출, 미적중), 2:파란색(미적중), 3:주황색(적중대기), 4:빨간색(적중), else 배팅 없음)', required: false })
  @IsOptional()
  @IsString()
  betting_state?: string;

  @ApiProperty({ example: '', description: '엠블럼 사용 유무(Y:사용, N:미사용)', required: false })
  @IsOptional()
  @IsString()
  em_flag?: string;

  @ApiProperty({ example: '', description: '배구/테니스 홈 현재 세트 점수(배구/테니스 경기일 경우만 사용, else : "")', required: false })
  @IsOptional()
  @IsString()
  v_h_cur_set_score?: string;

  @ApiProperty({ example: '', description: '배구/테니스 원정 현재 세트 점수(배구/테니스 경기일 경우만 사용, else : "")', required: false })
  @IsOptional()
  @IsString()
  v_a_cur_set_score?: string;

  @ApiProperty({ example: '', description: '태극전사 홈 유무(1:태극전사 유, else : 없음)', required: false })
  @IsOptional()
  @IsString()
  kor_player_home?: string;

  @ApiProperty({ example: '', description: '태극전사 원정 유무(1:태극전사 유, else : 없음)', required: false })
  @IsOptional()
  @IsString()
  kor_player_away?: string;

  @ApiProperty({ example: '', description: '태극전사 이름 홈', required: false })
  @IsOptional()
  @IsString()
  kor_player_home_name?: string;

  @ApiProperty({ example: '', description: '태극전사 이름 원정', required: false })
  @IsOptional()
  @IsString()
  kor_player_away_name?: string;

  @ApiProperty({ example: '', description: '야구 아웃카운트(0:노아웃, 1:원아웃, 2:투아웃-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  out?: string;

  @ApiProperty({ example: '', description: '야구 주자상황(0:주자없음, 1:1루, 2:2루, 3:3루, 4:1,2루, 5:1,3루, 6:2,3루, 7:만루)(야구 경기일 경우만 사용, else : "")-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  runner?: string;

  @ApiProperty({ example: '', description: '야구 홈,원정 FLAG(1:홈팀 공격, 2:원정팀 공격)(야구 경기일 경우만 사용, else : "")-blank일 경우 사용 안함', required: false })
  @IsOptional()
  @IsString()
  homeaway_flag?: string;

  @ApiProperty({ example: '', description: '축구 홈팀 경고 수(축구 경기일 경우만 사용, else : "")-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  home_ycard?: string;

  @ApiProperty({ example: '', description: '축구 홈팀 퇴장 수(축구 경기일 경우만 사용, else : "")-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  home_rcard?: string;

  @ApiProperty({ example: '', description: '축구 원정팀 경고 수(축구 경기일 경우만 사용, else : "")-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  away_ycard?: string;

  @ApiProperty({ example: '', description: '축구 원정팀 퇴장 수(축구 경기일 경우만 사용, else : "")-blank일 경우 비노출', required: false })
  @IsOptional()
  @IsString()
  away_rcard?: string;

  @ApiProperty({ example: '', description: '날씨 코드(1:해, 2:흐림, 3:비, 4:눈, 5:구름)-blank일 경우 날씨 정보 없음', required: false })
  @IsOptional()
  @IsString()
  weather_code?: string;

  @ApiProperty({ example: '', description: 'CCTV URL (blank : cctv url 없음)', required: false })
  @IsOptional()
  @IsString()
  cctv_link?: string;

  @ApiProperty({ example: '', description: 'CCTV 경기장 이름', required: false })
  @IsOptional()
  @IsString()
  cctv_name?: string;

  @ApiProperty({ example: '', description: '경기장 아이디', required: false })
  @IsOptional()
  @IsString()
  arena_id?: string;

  @ApiProperty({ example: '', description: '경기장 이름', required: false })
  @IsOptional()
  @IsString()
  arena_name?: string;

  @ApiProperty({ example: '', description: '경기장 이름 글씨 색상', required: false })
  @IsOptional()
  @IsString()
  arena_color?: string;

  @ApiProperty({ example: '', description: '홈팀 선수 아이디', required: false })
  @IsOptional()
  @IsString()
  home_player_id?: string;

  @ApiProperty({ example: '', description: '원정팀 선수 아이디', required: false })
  @IsOptional()
  @IsString()
  away_player_id?: string;

  @ApiProperty({ example: '', description: '홈팀 선수 이미지 유무', required: false })
  @IsOptional()
  @IsString()
  home_player_img_yn?: string;

  @ApiProperty({ example: '', description: '원정팀 선수 이미지 유무', required: false })
  @IsOptional()
  @IsString()
  away_player_img_yn?: string;

  @ApiProperty({ example: '', description: '홈팀 선수 이름', required: false })
  @IsOptional()
  @IsString()
  home_player_name?: string;

  @ApiProperty({ example: '', description: '원정팀 선수 이름', required: false })
  @IsOptional()
  @IsString()
  away_player_name?: string;

  @ApiProperty({ example: '', description: '해당 경기가 포함된 픽 등록수', required: false })
  @IsOptional()
  @IsString()
  pick_reg_cnt?: string;

  @ApiProperty({ example: '', description: '일반 문제 답 갯수 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  answer_item_cnt_n?: string;

  @ApiProperty({ example: '', description: '핸디캡 문제 답 갯수 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  answer_item_cnt_h?: string;

  @ApiProperty({ example: '', description: '일반 문제 홈승 응답 퍼센트 (종목이 야구일 경우는 홈패 응답 퍼센트) (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_w_per_n?: string;

  @ApiProperty({ example: '', description: '일반 문제 무 응답 퍼센트 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_d_per_n?: string;

  @ApiProperty({ example: '', description: '일반 문제 홈패 응답 퍼센트 (종목이 야구일 경우는 홈승 응답 퍼센트) (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_l_per_n?: string;

  @ApiProperty({ example: '', description: '핸디캡 문제 핸승 응답 퍼센트 (종목이 야구일 경우는 핸패 응답 퍼센트) (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_w_per_h?: string;

  @ApiProperty({ example: '', description: '핸디캡 문제 핸무 응답 퍼센트 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_d_per_h?: string;

  @ApiProperty({ example: '', description: '핸디캡 문제 핸패 응답 퍼센트 (종목이 야구일 경우는 핸승 응답 퍼센트) (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_l_per_h?: string;

  @ApiProperty({ example: '', description: '언더오버 문제 언더 응답 퍼센트 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_u_per_u?: string;

  @ApiProperty({ example: '', description: '언더오버 문제 오버 응답 퍼센트 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  item_o_per_u?: string;

  @ApiProperty({ example: '', description: '핸디캡 기준점 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  handicap_score_cn?: string;

  @ApiProperty({ example: '', description: '언더오버 기준점', required: false })
  @IsOptional()
  @IsString()
  underover_score_cn?: string;

  @ApiProperty({ example: '', description: '배구 세트별 홈팀 스코어 총합 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  v_h_total_set_score?: string;

  @ApiProperty({ example: '', description: '배구 세트별 원정팀 스코어 총합 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  v_a_total_set_score?: string;

  @ApiProperty({ example: '', description: '답 문구 컬러 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  betting_phrase_color?: string;

  @ApiProperty({ example: '', description: '답 문구 홈팀 점수 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  betting_home_score?: string;

  @ApiProperty({ example: '', description: '답 문구 원정팀 점수 (betting_phrase_flag가 Y로 요청했을때만 내려감)', required: false })
  @IsOptional()
  @IsString()
  betting_away_score?: string;

  @ApiProperty({ description: '베팅 배당률 상세 정보', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => GameBetRtDto)
  bet_rt?: GameBetRtDto;

  @ApiProperty({ example: '', description: '현재 경기 남은 시간 (농구, 아이스하키, 미식축구에 사용)', required: false })
  @IsOptional()
  @IsString()
  cur_time?: string;

  @ApiProperty({ example: '', description: '농구 팀파울 (blank : 없음, 홈팀 : 1, 원정팀 : 2, 양팀 : 3)', required: false })
  @IsOptional()
  @IsString()
  team_foul?: string;

  @ApiProperty({ example: '', description: '경기진행 상태 코드 (아이스하키 : S_1PF(1P 종료), S_2PF(2P 종료), S_3PF(3P 종료), S_OT(연장), S_PSU(승부샷)', required: false })
  @IsOptional()
  @IsString()
  state_txt_code?: string;

  @ApiProperty({ 
    description: '추가 시간 정보 (축구 경기에서 사용)', 
    type: InjTimeDto,
    required: false 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InjTimeDto)
  injtime?: InjTimeDto;

  @ApiProperty({ example: '', description: '회차 번호(최신 회차 번호)', required: false })
  @IsOptional()
  @IsString()
  round_no?: string;

  @ApiProperty({ example: '', description: '경기 번호', required: false })
  @IsOptional()
  @IsString()
  game_no?: string;

  @ApiProperty({ example: 'P', description: '프로토, 승무패 구분자(P:프로토, F:승무패)', required: false })
  @IsOptional()
  @IsString()
  diviedend_sc?: string;

  @ApiProperty({ example: '', description: '프로토 경기타입(N:일반, H:핸디캡, U:언더 오버) - 토토경기에서만 사용(P,F)', required: false })
  @IsOptional()
  @IsString()
  type_sc?: string;

  @ApiProperty({ example: '1.71', description: '홈팀 배당률', required: false })
  @IsOptional()
  @IsString()
  home_bet_rt?: string;

  @ApiProperty({ example: '', description: '무승부 배당률', required: false })
  @IsOptional()
  @IsString()
  draw_bet_rt?: string;

  @ApiProperty({ example: '1.77', description: '원정팀 배당률', required: false })
  @IsOptional()
  @IsString()
  away_bet_rt?: string;

  @ApiProperty({ example: '', description: '홈 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  home_bet_ud?: string;

  @ApiProperty({ example: '', description: '무승부 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  draw_bet_ud?: string;

  @ApiProperty({ example: '', description: '원정 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  away_bet_ud?: string;

  @ApiProperty({ example: '', description: '이전 홈 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  before_home_bet_rt?: string;

  @ApiProperty({ example: '', description: '이전 무승부 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  before_draw_bet_rt?: string;

  @ApiProperty({ example: '', description: '이전 원정 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  before_away_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 홈 배당율', required: false })
  @IsOptional()
  @IsString()
  f_home_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 무승부 배당률', required: false })
  @IsOptional()
  @IsString()
  f_draw_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 원정 배당률', required: false })
  @IsOptional()
  @IsString()
  f_away_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외 홈 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  f_home_bet_ud?: string;

  @ApiProperty({ example: '', description: '해외 무승부 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  f_draw_bet_ud?: string;

  @ApiProperty({ example: '', description: '해외 원정 배당률 상승 하락 FLAG(U:상승, D:하락, else : 변화 없음)', required: false })
  @IsOptional()
  @IsString()
  f_away_bet_ud?: string;

  @ApiProperty({ example: '', description: '해외배당 핸디캡 수치', required: false })
  @IsOptional()
  @IsString()
  f_handicap_score_cn?: string;

  @ApiProperty({ example: '', description: '해외배당 언더오버 수치', required: false })
  @IsOptional()
  @IsString()
  f_underover_score_cn?: string;

  @ApiProperty({ example: '', description: '해외배당 이전 홈 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  f_before_home_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 이전 무승부 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  f_before_draw_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 이전 원정 배당률(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  f_before_away_bet_rt?: string;

  @ApiProperty({ example: '', description: '해외배당 이전 핸디캡 수치(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  f_before_handicap_score_cn?: string;

  @ApiProperty({ example: '', description: '해외배당 이전 언더오버 수치(change_bet_rt_flag가 "Y"일 경우만 엘리멘트 내려감)', required: false })
  @IsOptional()
  @IsString()
  f_before_underover_score_cn?: string;

  @ApiProperty({ example: '', description: '배당률 변경 유무(Y:배팅률 변경됨, N:배팅률 변경 안됨)', required: false })
  @IsOptional()
  @IsString()
  change_bet_rt_flag?: string;

  @ApiProperty({ example: '', description: '이전 핸디캡 수치', required: false })
  @IsOptional()
  @IsString()
  before_handicap_score_cn?: string;

  @ApiProperty({ example: '', description: '이전 언더오버 수치', required: false })
  @IsOptional()
  @IsString()
  before_underover_score_cn?: string;

  @ApiProperty({ example: '', description: 'single_game_flag - Y : 한 경기만 선택 가능, else : 복수 경기 선택', required: false })
  @IsOptional()
  @IsString()
  single_game_flag?: string;

  @ApiProperty({ example: '', description: '오늘 UV', required: false })
  @IsOptional()
  @IsString()
  uv_cn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  top_phrase_string_normal?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  top_phrase_string_handicap?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  top_phrase_string_underover?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  top_phrase_string?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  top_phrase_color?: string;

  @ApiProperty({ 
    description: '팀 전적 정보 (야구 경기, A타입에서 사용)', 
    type: TeamRecordDto,
    required: false 
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TeamRecordDto)
  teamRecord?: TeamRecordDto;

  @ApiProperty({ 
    example: 'topMost', 
    description: '상단 고정 타입',
    enum: TopfixType,
    required: false 
  })
  @IsOptional()
  @IsEnum(TopfixType)
  topFixType?: TopfixType;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsBoolean()
  isDisplayGameInfo?: boolean;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsBoolean()
  isFoldLeagueMember?: boolean;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  detail_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  rank_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  btn_home_name?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  btn_away_name?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  vod_link?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  lineup_flag?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  broadcast_history_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  p_record_flag?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  ani_info?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  action_info?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  betting_winning_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  betting_hit_cnt?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  betting_answer_cnt?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  service_type?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  result_vs?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  result_re?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  result_rank?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  h_team_rank?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  a_team_rank?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  graphic_broadcast_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  graphic_default_flag?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  link_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  link_result_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  caster_type?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  caster_type_history?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  caster_id?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  caster_name?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  img_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_btn_color?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_btn_name?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_font_color?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_link_type?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_link_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  title_webview_link_title?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  tutorial_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  tutorial_img_url?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  funfact_yn?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  funfact_upd_date?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  funfact_title?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  funfact_prediction?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  steller_win?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  steller_draw?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  steller_loss?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  vod_btn_type?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsString()
  naviFromAnotherGame?: string;

  @ApiProperty({ example: '', description: 'api 문서보고 정리할 것', required: false })
  @IsOptional()
  @IsBoolean()
  displayMatchDate?: boolean;
}

// ==================== 메인 생성 DTO ====================
export class CreateBettingReceiptDto {
  @ApiProperty({ 
    example: 'A1qUCFO+ct1+XUV+7gqvpw==', 
    description: '사용자 번호 (암호화된 값)' 
  })
  @IsString()
  user_no: string;

  @ApiProperty({ 
    example: 'P', 
    description: '베팅 타입 (P:프로토, F:승부식, A:승5패, B:승1패)',
    enum: ['P', 'F', 'A', 'B']
  })
  @IsEnum(['P', 'F', 'A', 'B'])
  type: string;

  @ApiProperty({ 
    description: '회차 정보 (발매금액, 적중금 등)',
    type: RoundInfoDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RoundInfoDto)
  round_info: RoundInfoDto;

  @ApiProperty({ 
    description: '사용자가 선택한 배팅 정보',
    type: TotoCalcBookmarkRoundInfoDto
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TotoCalcBookmarkRoundInfoDto)
  calc_model: TotoCalcBookmarkRoundInfoDto;

  @ApiProperty({ 
    description: '선택된 게임 원본 데이터 목록',
    type: [GameDto]
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => GameDto)
  selected_games: GameDto[];

  @ApiProperty({ 
    example: '2025-09-11T05:30:00.000Z', 
    description: '생성 일시 (ISO 8601 형식)' 
  })
  @IsString()
  create_date: string;
}

// ==================== 업데이트 DTO (기존 유지) ====================
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

// ==================== 응답 DTO ====================
export class CreateBettingReceiptResponse extends generateResponse(BettingReceipt) {}
export class UpdateBettingReceiptResponse extends generateResponse(BettingReceipt) {}

// ==================== 필터 DTO (기존 유지) ====================
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
    example: 'P', 
    description: '베팅 타입',
    enum: ['P', 'F', 'A', 'B'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['P', 'F', 'A', 'B'])
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