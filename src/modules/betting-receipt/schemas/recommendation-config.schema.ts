// src/modules/betting-receipt/schemas/recommendation-config.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type RecommendationConfigDocument = HydratedDocument<RecommendationConfig>;

@Schema({ 
  timestamps: true,
  collection: 'recommendation_configs'
})
export class RecommendationConfig {
  @ApiProperty({ example: 30, description: '리그 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 30, min: 0, max: 100 })
  league_weight: number;

  @ApiProperty({ example: 25, description: '종목 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 25, min: 0, max: 100 })
  compe_weight: number;

  @ApiProperty({ example: 25, description: '팀 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 25, min: 0, max: 100 })
  team_weight: number;

  @ApiProperty({ example: 10, description: '시간대 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 10, min: 0, max: 100 })
  time_weight: number;

  @ApiProperty({ example: 10, description: '요일 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 10, min: 0, max: 100 })
  day_weight: number;

  @ApiProperty({ example: 10, description: '최근성 보너스 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 10, min: 0, max: 100 })
  recency_weight: number;

  @ApiProperty({ example: 20, description: '유저 정확도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 20, min: 0, max: 100 })
  accuracy_weight: number;

  @ApiProperty({ example: 15, description: '배팅 타입 일관성 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 15, min: 0, max: 100 })
  betting_type_consistency_weight: number;

  @ApiProperty({ example: 10, description: '배당률 선호도 가중치 (0-100)' })
  @Prop({ type: Number, required: true, default: 10, min: 0, max: 100 })
  odds_preference_weight: number;

  @ApiProperty({ example: 20, description: '최소 추천 점수 (0-100)' })
  @Prop({ type: Number, required: true, default: 20, min: 0, max: 100 })
  min_recommendation_score: number;

  @ApiProperty({ example: 5, description: '추천 경기 개수 (1-10)' })
  @Prop({ type: Number, required: true, default: 5, min: 1, max: 10 })
  max_recommendations: number;

  @ApiProperty({ example: 7, description: '최근성 판단 기준 일수 (1-30)' })
  @Prop({ type: Number, required: true, default: 7, min: 1, max: 30 })
  recency_days: number;

  @ApiProperty({ example: 'v1.1', description: '알고리즘 버전' })
  @Prop({ type: String, required: true, default: 'v1.1' })
  version: string;

  @ApiProperty({ example: true, description: '활성화 여부' })
  @Prop({ type: Boolean, required: true, default: true })
  is_active: boolean;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;
}

export const RecommendationConfigSchema = SchemaFactory.createForClass(RecommendationConfig);