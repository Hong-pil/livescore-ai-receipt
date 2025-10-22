// // src/modules/betting-receipt/dtos/recommendation-config.dto.ts
// import { ApiProperty } from '@nestjs/swagger';
// import { IsNumber, IsString, IsBoolean, IsOptional, Min, Max } from 'class-validator';

// export class UpdateRecommendationConfigDto {
//   @ApiProperty({ example: 30, description: '리그 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   league_weight?: number;

//   @ApiProperty({ example: 25, description: '종목 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   compe_weight?: number;

//   @ApiProperty({ example: 25, description: '팀 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   team_weight?: number;

//   @ApiProperty({ example: 10, description: '시간대 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   time_weight?: number;

//   @ApiProperty({ example: 10, description: '요일 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   day_weight?: number;

//   @ApiProperty({ example: 10, description: '최근성 보너스 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   recency_weight?: number;

//   @ApiProperty({ example: 20, description: '유저 정확도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   accuracy_weight?: number;

//   @ApiProperty({ example: 15, description: '배팅 타입 일관성 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   betting_type_consistency_weight?: number;

//   @ApiProperty({ example: 10, description: '배당률 선호도 가중치', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   odds_preference_weight?: number;

//   @ApiProperty({ example: 20, description: '최소 추천 점수', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(0)
//   @Max(100)
//   min_recommendation_score?: number;

//   @ApiProperty({ example: 5, description: '추천 경기 개수', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   @Max(10)
//   max_recommendations?: number;

//   @ApiProperty({ example: 7, description: '최근성 판단 기준 일수', required: false })
//   @IsOptional()
//   @IsNumber()
//   @Min(1)
//   @Max(30)
//   recency_days?: number;

//   @ApiProperty({ example: 'v1.1', description: '알고리즘 버전', required: false })
//   @IsOptional()
//   @IsString()
//   version?: string;

//   @ApiProperty({ example: true, description: '활성화 여부', required: false })
//   @IsOptional()
//   @IsBoolean()
//   is_active?: boolean;
// }