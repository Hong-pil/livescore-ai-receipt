// src/modules/betting-receipt/schemas/betting-receipt.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type BettingReceiptDocument = HydratedDocument<BettingReceipt>;

// 베팅 배당률 정보
@Schema({ _id: false })
export class GameBetRt {
  @ApiProperty({ example: '1.06', description: '홈팀 배당률' })
  @Prop({ type: String })
  h_rt: string;

  @ApiProperty({ example: '-', description: '무승부 배당률' })
  @Prop({ type: String })
  d_rt: string;

  @ApiProperty({ example: '4.85', description: '원정팀 배당률' })
  @Prop({ type: String })
  a_rt: string;

  @ApiProperty({ example: 'u', description: '홈팀 배당률 증감' })
  @Prop({ type: String })
  h_ud: string;

  @ApiProperty({ example: '', description: '무승부 배당률 증감' })
  @Prop({ type: String })
  d_ud: string;

  @ApiProperty({ example: 'd', description: '원정팀 배당률 증감' })
  @Prop({ type: String })
  a_ud: string;

  @ApiProperty({ example: '81', description: '홈팀 예상 확률' })
  @Prop({ type: String })
  h_e_p: string;

  @ApiProperty({ example: '19', description: '원정팀 예상 확률' })
  @Prop({ type: String })
  a_e_p: string;

  @ApiProperty({ example: 'Y', description: '히스토리 존재 여부' })
  @Prop({ type: String })
  history_yn: string;
}

// 게임 정보
@Schema({ _id: false })
export class GameInfo {
  @ApiProperty({ example: 'OT2025331103238', description: '게임 ID' })
  @Prop({ required: true })
  game_id: string;

  @ApiProperty({ example: 'basketball', description: '스포츠 종목' })
  @Prop({ required: true })
  compe: string;

  @ApiProperty({ example: 'OT331', description: '리그 ID' })
  @Prop({ type: String })
  league_id: string;

  @ApiProperty({ example: '유로바스켓', description: '리그명' })
  @Prop({ required: true })
  league_name: string;

  @ApiProperty({ example: '2025-09-11', description: '경기 날짜' })
  @Prop({ required: true })
  match_date: string;

  @ApiProperty({ example: '03:00', description: '경기 시간' })
  @Prop({ required: true })
  match_time: string;

  @ApiProperty({ example: 'OT31158', description: '홈팀 ID' })
  @Prop({ type: String })
  home_team_id: string;

  @ApiProperty({ example: '독일', description: '홈팀명' })
  @Prop({ required: true })
  home_team_name: string;

  @ApiProperty({ example: 'OT31143', description: '원정팀 ID' })
  @Prop({ type: String })
  away_team_id: string;

  @ApiProperty({ example: '슬로베니아', description: '원정팀명' })
  @Prop({ required: true })
  away_team_name: string;

  @ApiProperty({ example: '0', description: '홈팀 점수' })
  @Prop({ type: String, default: '0' })
  home_score: string;

  @ApiProperty({ example: '0', description: '원정팀 점수' })
  @Prop({ type: String, default: '0' })
  away_score: string;

  @ApiProperty({ example: 'before', description: '경기 상태' })
  @Prop({ type: String })
  state: string;

  @ApiProperty({ example: '경기전', description: '경기 상태 텍스트' })
  @Prop({ type: String })
  state_txt: string;

  @ApiProperty({ example: '-11.5', description: '핸디캡 점수' })
  @Prop({ type: String })
  handicap_score_cn: string;

  @ApiProperty({ example: '1.71', description: '홈팀 베팅 배당률' })
  @Prop({ type: String })
  home_bet_rt: string;

  @ApiProperty({ example: '1.77', description: '원정팀 베팅 배당률' })
  @Prop({ type: String })
  away_bet_rt: string;

  @ApiProperty({ description: '베팅 배당률 상세 정보' })
  @Prop({ type: GameBetRt })
  bet_rt?: GameBetRt;

  @ApiProperty({ example: '107', description: '라운드 번호' })
  @Prop({ type: String })
  round_no: string;

  @ApiProperty({ example: '006', description: '게임 번호' })
  @Prop({ type: String })
  game_no: string;
}

// 베팅 항목
@Schema({ _id: false })
export class BettingItem {
  @ApiProperty({ example: 'OT2025331103238', description: '게임 ID' })
  @Prop({ required: true })
  game_id: string;

  @ApiProperty({ example: 'home', description: '베팅 타입 (home/away/draw)' })
  @Prop({ required: true })
  betting_type: string;

  @ApiProperty({ example: '독일', description: '베팅한 팀명' })
  @Prop({ required: true })
  selected_team: string;

  @ApiProperty({ example: '1.06', description: '베팅 배당률' })
  @Prop({ required: true })
  odds: string;

  @ApiProperty({ example: 10000, description: '베팅 금액' })
  @Prop({ required: true, type: Number })
  betting_amount: number;

  @ApiProperty({ example: 10600, description: '예상 당첨 금액' })
  @Prop({ required: true, type: Number })
  expected_payout: number;
}

// 메인 스키마
@Schema({ 
  timestamps: true,
  collection: 'betting_receipts'
})
export class BettingReceipt {
  @ApiProperty({ example: 'A1qUCFO+ct1+XUV+7gqvpw==', description: '사용자 번호' })
  @Prop({ required: true })
  user_no: string;

  @ApiProperty({ example: 'RECEIPT_202509111234567', description: '영수증 고유 ID' })
  @Prop({ required: true, unique: true })
  receipt_id: string;

  @ApiProperty({ description: '선택된 게임 목록' })
  @Prop({ type: [GameInfo], required: true })
  selected_games: GameInfo[];

  @ApiProperty({ description: '베팅 항목 목록' })
  @Prop({ type: [BettingItem], required: true })
  betting_items: BettingItem[];

  @ApiProperty({ example: 50000, description: '총 베팅 금액' })
  @Prop({ required: true, type: Number })
  total_betting_amount: number;

  @ApiProperty({ example: 125000, description: '총 예상 당첨 금액' })
  @Prop({ required: true, type: Number })
  total_expected_payout: number;

  @ApiProperty({ example: '2.5', description: '전체 배당률' })
  @Prop({ required: true })
  total_odds: string;

  @ApiProperty({ example: 'pending', description: '베팅 상태 (pending/won/lost/cancelled)' })
  @Prop({ required: true, default: 'pending' })
  status: string;

  @ApiProperty({ example: 'proto', description: '베팅 타입 (proto/real)' })
  @Prop({ required: true, default: 'proto' })
  betting_type: string;

  @ApiProperty({ description: '생성일시' })
  @Prop({ type: Date })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @Prop({ type: Date })
  updatedAt: Date;
}

export const GameBetRtSchema = SchemaFactory.createForClass(GameBetRt);
export const GameInfoSchema = SchemaFactory.createForClass(GameInfo);
export const BettingItemSchema = SchemaFactory.createForClass(BettingItem);
export const BettingReceiptSchema = SchemaFactory.createForClass(BettingReceipt);