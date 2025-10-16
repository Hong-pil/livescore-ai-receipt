// src/modules/betting-receipt/controllers/recommendation.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationResult } from '../services/recommendation.service';

@ApiTags('🎯 경기 추천 시스템')
@Controller('api/v1/recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
  ) {}

  // ==================== 경기 추천 API ====================
  @Post('games')
  @ApiOperation({
    summary: '사용자 맞춤 경기 추천',
    description: `
사용자의 과거 배팅 이력을 분석하여 현재 배팅 가능한 경기 중 
관심 있을만한 경기를 추천합니다.

**추천 알고리즘:**
- 리그 선호도 (30점)
- 종목 선호도 (25점)  
- 팀 선호도 (25점)
- 시간대 선호도 (10점)
- 요일 선호도 (10점)
- 최근성 보너스 (10점)

**총 100점 만점으로 점수를 매겨 상위 5개 경기를 추천합니다.**
    `,
  })
  @ApiBody({
    description: '현재 배팅 가능한 경기 목록',
    schema: {
      type: 'object',
      properties: {
        user_no: {
          type: 'string',
          example: '7NZ7ERp5AD4YE/5VJfS2ig==',
          description: '사용자 번호',
        },
        available_games: {
          type: 'array',
          description: '현재 배팅 가능한 경기 목록 (앱에서 전달)',
          items: {
            type: 'object',
            properties: {
              game_id: { type: 'string', example: 'OT20251412931896' },
              game_no: { type: 'string', example: '042' },
              league_name: { type: 'string', example: 'NPB' },
              league_id: { type: 'string', example: 'OT141' },
              compe: { type: 'string', example: 'baseball' },
              home_team_name: { type: 'string', example: '한신' },
              away_team_name: { type: 'string', example: '요코하마' },
              match_date: { type: 'string', example: '2025-10-16' },
              match_time: { type: 'string', example: '18:00' },
              handicap_score_cn: { type: 'string', example: '-2.5' },
              home_bet_rt: { type: 'string', example: '2.81' },
              away_bet_rt: { type: 'string', example: '1.26' },
            },
          },
        },
      },
    },
    examples: {
      request: {
        summary: '요청 예시',
        value: {
          user_no: '7NZ7ERp5AD4YE/5VJfS2ig==',
          available_games: [
            {
              game_id: 'OT20251412931896',
              game_no: '042',
              league_name: 'NPB',
              league_id: 'OT141',
              compe: 'baseball',
              home_team_name: '한신',
              away_team_name: '요코하마',
              match_date: '2025-10-16',
              match_time: '18:00',
              handicap_score_cn: '-2.5',
              home_bet_rt: '2.81',
              away_bet_rt: '1.26',
            },
            {
              game_id: 'EB18ES_3210303757',
              game_no: '060',
              league_name: 'KBL',
              league_id: '32',
              compe: 'basketball',
              home_team_name: '원주DB',
              away_team_name: '부산KCC',
              match_date: '2025-10-16',
              match_time: '19:00',
              handicap_score_cn: '-3.5',
              home_bet_rt: '1.68',
              away_bet_rt: '1.80',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '추천 결과가 성공적으로 생성되었습니다.',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            user_no: { type: 'string', example: '7NZ7ERp5AD4YE/5VJfS2ig==' },
            recommended_games: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  game_id: { type: 'string' },
                  game_no: { type: 'string' },
                  league_name: { type: 'string' },
                  compe: { type: 'string' },
                  home_team_name: { type: 'string' },
                  away_team_name: { type: 'string' },
                  match_date: { type: 'string' },
                  match_time: { type: 'string' },
                  recommended_betting_type: {
                    type: 'string',
                    description: 'home, away, draw, handicap_home, handicap_away',
                  },
                  confidence_score: {
                    type: 'number',
                    description: '추천 신뢰도 점수 (0-100)',
                  },
                  reason: { type: 'string', description: '추천 이유' },
                  frequency: { type: 'number', description: '과거 선택 빈도' },
                  recent_selection_count: {
                    type: 'number',
                    description: '최근 30일 선택 횟수',
                  },
                },
              },
            },
            analysis: {
              type: 'object',
              properties: {
                total_receipts: { type: 'number', description: '총 영수증 개수' },
                favorite_league: { type: 'string', description: '선호 리그' },
                favorite_compe: { type: 'string', description: '선호 종목' },
                favorite_betting_type: {
                  type: 'string',
                  description: '선호 배팅 타입',
                },
                most_selected_team: {
                  type: 'string',
                  description: '가장 많이 선택한 팀',
                },
                recent_activity_days: {
                  type: 'number',
                  description: '최근 활동 일수',
                },
              },
            },
            generated_at: { type: 'string', format: 'date-time' },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터입니다.' })
  async getRecommendations(
    @Body() body: { user_no: string; available_games: any[] },
  ): Promise<{
    success: boolean;
    data: RecommendationResult | null;
    message: string;
  }> {
    const { user_no, available_games } = body;

    if (!user_no || !available_games || available_games.length === 0) {
      return {
        success: false,
        data: null,
        message: 'user_no와 available_games는 필수입니다.',
      };
    }

    const result = await this.recommendationService.getRecommendations(
      user_no,
      available_games,
    );

    return {
      success: true,
      data: result,
      message: `${result.recommended_games.length}개의 경기를 추천합니다.`,
    };
  }

  // ==================== 유저 패턴 상세 조회 (디버깅용) ====================
  @Get('pattern/:userNo')
  @ApiOperation({
    summary: '사용자 배팅 패턴 분석 조회',
    description: `
사용자의 과거 6개월 배팅 이력을 분석한 결과를 조회합니다.

**분석 내용:**
- 리그별 선택 빈도 및 최근 선택 횟수
- 종목별 선택 빈도
- 팀별 선택 빈도
- 배팅 타입별 선호도
- 시간대별 선호도
- 요일별 선호도
- 종목 조합 패턴

**디버깅 및 분석 용도로 사용하세요.**
    `,
  })
  @ApiParam({
    name: 'userNo',
    description: '사용자 번호',
    example: '7NZ7ERp5AD4YE/5VJfS2ig==',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 패턴 분석 결과',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user_no: { type: 'string' },
            total_receipts: { type: 'number' },
            leagues: {
              type: 'object',
              description: '리그별 선택 통계',
              example: {
                NPB: { count: 10, recent_count: 3 },
                KBL: { count: 5, recent_count: 1 },
              },
            },
            compes: {
              type: 'object',
              description: '종목별 선택 통계',
              example: {
                baseball: { count: 12, recent_count: 4 },
                basketball: { count: 8, recent_count: 2 },
              },
            },
            teams: {
              type: 'object',
              description: '팀별 선택 통계',
              example: {
                한신: { count: 5, recent_count: 2, league: 'NPB' },
              },
            },
            betting_types: {
              type: 'object',
              description: '배팅 타입별 선택 통계',
              example: {
                handicap_home: { count: 8, recent_count: 3 },
                draw: { count: 4, recent_count: 1 },
              },
            },
            time_preferences: {
              type: 'object',
              description: '시간대별 선호도',
              example: {
                '18:00': 15,
                '19:00': 10,
              },
            },
            day_preferences: {
              type: 'object',
              description: '요일별 선호도',
              example: {
                토: 8,
                일: 6,
              },
            },
            compe_combinations: {
              type: 'object',
              description: '종목 조합 패턴',
              example: {
                'baseball+basketball': 5,
              },
            },
          },
        },
        message: { type: 'string' },
      },
    },
  })
  async getUserPattern(@Param('userNo') userNo: string) {
    const pattern = await this.recommendationService.getUserPattern(userNo);

    return {
      success: true,
      data: pattern,
      message: '사용자 패턴이 분석되었습니다.',
    };
  }

  // ==================== 추천 알고리즘 설명 조회 ====================
  @Get('algorithm/info')
  @ApiOperation({
    summary: '추천 알고리즘 설명',
    description: '현재 사용 중인 추천 알고리즘의 상세 설명을 제공합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '알고리즘 설명',
  })
  getAlgorithmInfo() {
    return {
      success: true,
      data: {
        version: '1.0.0',
        type: 'Rule-based Algorithm',
        description: '사용자의 과거 배팅 이력을 기반으로 규칙 기반 추천을 제공합니다.',
        scoring_weights: {
          league_preference: {
            weight: 30,
            description: '자주 선택한 리그에 높은 점수 부여',
          },
          compe_preference: {
            weight: 25,
            description: '자주 선택한 종목에 높은 점수 부여',
          },
          team_preference: {
            weight: 25,
            description: '자주 선택한 팀이 포함된 경기에 높은 점수 부여',
          },
          time_preference: {
            weight: 10,
            description: '선호하는 시간대 경기에 가산점',
          },
          day_preference: {
            weight: 10,
            description: '선호하는 요일 경기에 가산점',
          },
          recency_bonus: {
            weight: 10,
            description: '최근 7일 내 선택한 리그에 보너스 점수',
          },
        },
        data_range: '최근 6개월 배팅 이력',
        recommendation_count: '상위 5개 경기',
        minimum_score: 20,
        features: [
          '리그별 선택 빈도 분석',
          '종목별 선택 빈도 분석',
          '팀별 선택 빈도 분석',
          '배팅 타입 선호도 분석',
          '시간대별 선호도 분석',
          '요일별 선호도 분석',
          '최근 30일 가중치 적용',
          '종목 조합 패턴 분석',
        ],
        limitations: [
          '신규 유저는 기본 추천만 제공',
          '배팅 이력이 적으면 정확도 낮음 (최소 3개 이상 권장)',
          '적중률 기반 추천은 아직 미구현',
        ],
        next_features: [
          '적중률 기반 가중치 추가',
          '시간대별 성공률 분석',
          '배당률 선호도 분석',
          'AI 모델 하이브리드',
        ],
      },
      message: '추천 알고리즘 정보가 조회되었습니다.',
    };
  }

  // ==================== 추천 테스트 API (개발용) ====================
  @Get('test/:userNo')
  @ApiOperation({
    summary: '추천 시스템 테스트',
    description: `
개발 및 테스트 용도로 샘플 경기 데이터를 사용하여 추천을 생성합니다.
실제 배팅 가능한 경기가 없을 때 테스트용으로 사용하세요.
    `,
  })
  @ApiParam({
    name: 'userNo',
    description: '사용자 번호',
    example: '7NZ7ERp5AD4YE/5VJfS2ig==',
  })
  @ApiResponse({
    status: 200,
    description: '테스트 추천 결과',
  })
  async testRecommendation(@Param('userNo') userNo: string): Promise<{
    success: boolean;
    data: RecommendationResult;
    message: string;
    note: string;
  }> {
    // 테스트용 샘플 경기 데이터
    const sampleGames = [
      {
        game_id: 'TEST_001',
        game_no: '001',
        league_name: 'NPB',
        league_id: 'OT141',
        compe: 'baseball',
        home_team_name: '한신',
        away_team_name: '요코하마',
        match_date: '2025-10-17',
        match_time: '18:00',
        handicap_score_cn: '-2.5',
        home_bet_rt: '2.81',
        away_bet_rt: '1.26',
      },
      {
        game_id: 'TEST_002',
        game_no: '002',
        league_name: 'NPB',
        league_id: 'OT141',
        compe: 'baseball',
        home_team_name: '소프트뱅크',
        away_team_name: '닛폰햄',
        match_date: '2025-10-17',
        match_time: '18:00',
        handicap_score_cn: '0.0',
        home_bet_rt: '2.50',
        away_bet_rt: '2.55',
      },
      {
        game_id: 'TEST_003',
        game_no: '003',
        league_name: 'KBL',
        league_id: '32',
        compe: 'basketball',
        home_team_name: '원주DB',
        away_team_name: '부산KCC',
        match_date: '2025-10-17',
        match_time: '19:00',
        handicap_score_cn: '-3.5',
        home_bet_rt: '1.68',
        away_bet_rt: '1.80',
      },
      {
        game_id: 'TEST_004',
        game_no: '004',
        league_name: 'KBO',
        league_id: 'KBO',
        compe: 'baseball',
        home_team_name: '두산',
        away_team_name: 'LG',
        match_date: '2025-10-17',
        match_time: '18:30',
        handicap_score_cn: '-1.5',
        home_bet_rt: '2.10',
        away_bet_rt: '1.65',
      },
      {
        game_id: 'TEST_005',
        game_no: '005',
        league_name: 'EPL',
        league_id: 'EPL',
        compe: 'soccer',
        home_team_name: '맨유',
        away_team_name: '첼시',
        match_date: '2025-10-17',
        match_time: '23:00',
        handicap_score_cn: '0.0',
        home_bet_rt: '2.30',
        away_bet_rt: '2.80',
      },
    ];

    const result = await this.recommendationService.getRecommendations(
      userNo,
      sampleGames,
    );

    return {
      success: true,
      data: result,
      message: '테스트 추천이 생성되었습니다.',
      note: '이것은 테스트용 샘플 데이터를 사용한 결과입니다.',
    };
  }
}