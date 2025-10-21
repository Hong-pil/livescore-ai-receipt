// src/modules/betting-receipt/controllers/recommendation.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  Put,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RecommendationService } from '../services/recommendation.service';
import { RecommendationResult } from '../services/recommendation.service';
import { TestDataGenerator } from '../../../scripts/generate-test-data'

@ApiTags('🎯 경기 추천 시스템')
@Controller('api/v1/recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly testDataGenerator: TestDataGenerator,
  ) { }

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
async getAlgorithmInfo() {
  const config = await this.recommendationService.getConfig();
  
  return {
    success: true,
    data: {
      version: config.version,
      type: 'Rule-based Algorithm with Dynamic Weights',
      description: '사용자의 과거 배팅 이력을 기반으로 가중치 기반 추천을 제공합니다.',
      current_weights: {
        league_preference: {
          weight: config.league_weight,
          description: '자주 선택한 리그에 높은 점수 부여',
        },
        compe_preference: {
          weight: config.compe_weight,
          description: '자주 선택한 종목에 높은 점수 부여',
        },
        team_preference: {
          weight: config.team_weight,
          description: '자주 선택한 팀이 포함된 경기에 높은 점수 부여',
        },
        time_preference: {
          weight: config.time_weight,
          description: '선호하는 시간대 경기에 가산점',
        },
        day_preference: {
          weight: config.day_weight,
          description: '선호하는 요일 경기에 가산점',
        },
        recency_bonus: {
          weight: config.recency_weight,
          description: `최근 ${config.recency_days}일 내 선택한 리그에 보너스 점수`,
        },
        user_accuracy: {
          weight: config.accuracy_weight,
          description: '유저 적중률에 따른 가중치 (높을수록 신뢰도 높음)',
        },
        betting_type_consistency: {
          weight: config.betting_type_consistency_weight,
          description: '일관된 배팅 타입 선호도',
        },
        odds_preference: {
          weight: config.odds_preference_weight,
          description: '선호하는 배당률 패턴 분석',
        },
      },
      settings: {
        data_range: '최근 6개월 배팅 이력',
        recommendation_count: config.max_recommendations,
        minimum_score: config.min_recommendation_score,
        recency_days: config.recency_days,
      },
      features: [
        '리그별 선택 빈도 분석',
        '종목별 선택 빈도 분석',
        '팀별 선택 빈도 분석',
        '배팅 타입 선호도 분석',
        '시간대별 선호도 분석',
        '요일별 선호도 분석',
        '최근 30일 가중치 적용',
        '종목 조합 패턴 분석',
        '유저 적중률 기반 신뢰도 분석',
        '배당률 선호도 패턴 분석',
        '배팅 타입 일관성 분석',
      ],
      limitations: [
        '신규 유저는 기본 추천만 제공',
        '배팅 이력이 적으면 정확도 낮음 (최소 5개 이상 권장)',
        '실시간 경기 상황은 반영하지 않음',
      ],
      next_features: [
        '시간대별 성공률 분석',
        'AI 모델 하이브리드',
        '실시간 배당률 변동 추적',
        '경기 결과 예측 모델 통합',
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

  // 테스트 데이터 생성
  @Post('admin/generate-test-data')
  @ApiOperation({
    summary: '테스트 데이터 생성 (관리자용)',
    description: '현실적인 테스트 영수증 데이터를 대량 생성합니다.'
  })
  async generateTestData(
    @Body() body: { count: number }
  ): Promise<any> {
    const result = await this.testDataGenerator.generateTestData(body.count);

    return {
      success: true,
      data: result,
      message: `${result.total_receipts}개의 테스트 영수증이 생성되었습니다.`
    };
  }

  // ==================== 시각화 대시보드 ====================
  @Get('dashboard')
@ApiOperation({
  summary: '📊 테스트 데이터 시각화 대시보드',
  description: '생성된 테스트 데이터를 시각적으로 분석하는 대시보드를 제공합니다.'
})
async getDashboard(@Res() res: Response) {
  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>베팅 영수증 테스트 데이터 분석</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    h1 {
      color: white;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .config-btn {
      padding: 15px 30px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 10px;
      font-size: 1.1em;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }

    .config-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 20px rgba(0,0,0,0.3);
    }

    /* 모달 스타일 */
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      animation: fadeIn 0.3s;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background-color: white;
      margin: 5% auto;
      padding: 30px;
      border-radius: 15px;
      width: 90%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      animation: slideIn 0.3s;
    }

    @keyframes slideIn {
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #eee;
    }

    .modal-title {
      font-size: 1.8em;
      color: #333;
      font-weight: bold;
    }

    .close-btn {
      font-size
       font-size: 2em;
      color: #999;
      cursor: pointer;
      background: none;
      border: none;
      transition: color 0.3s;
    }

    .close-btn:hover {
      color: #333;
    }

    .config-form {
      display: grid;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
      font-size: 0.95em;
    }

    .form-group input {
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1em;
      transition: border-color 0.3s;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-group small {
      color: #666;
      font-size: 0.85em;
    }

    .weight-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .total-weight {
      text-align: center;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 8px;
      margin: 15px 0;
      font-size: 1.1em;
      font-weight: bold;
    }

    .total-weight.warning {
      background: #fff3cd;
      color: #856404;
    }

    .button-group {
      display: flex;
      gap: 15px;
      margin-top: 25px;
    }

    .btn {
      flex: 1;
      padding: 15px;
      border: none;
      border-radius: 8px;
      font-size: 1.1em;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #667eea;
      margin: 10px 0;
    }

    .stat-label {
      color: #666;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .loading {
      color: white;
      text-align: center;
      font-size: 1.5em;
      margin-top: 50px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .chart-title {
      font-size: 1.3em;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .table-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      margin-bottom: 30px;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
    }

    td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }

    tr:hover {
      background: #f8f9fa;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 600;
    }

    .badge-success {
      background: #d4edda;
      color: #155724;
    }

    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }

    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }

    .success-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      z-index: 2000;
      animation: slideInRight 0.5s, slideOutRight 0.5s 2.5s;
      display: none;
    }

    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 1.8em;
      }

      .header {
        flex-direction: column;
        gap: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 베팅 영수증 테스트 데이터 분석 대시보드</h1>
      <button class="config-btn" onclick="openConfigModal()">⚙️ 추천 알고리즘</button>
    </div>

    <div class="loading" id="loading">📊 실제 데이터를 불러오는 중...</div>

    <div id="content" style="display: none;">
      <!-- 통계 카드 -->
      <div class="stats-grid" id="statsGrid"></div>

      <!-- 차트 그리드 -->
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-title">📊 페르소나별 영수증 생성 수</div>
          <canvas id="personaChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-title">⚽ 종목별 경기 분포</div>
          <canvas id="compeChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-title">⏰ 시간대별 배팅 빈도</div>
          <canvas id="timeChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-title">🎲 배팅 타입별 분포</div>
          <canvas id="bettingTypeChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-title">📈 월별 영수증 생성 추이</div>
          <canvas id="monthlyChart"></canvas>
        </div>

        <div class="chart-card">
          <div class="chart-title">🎯 페르소나별 적중률</div>
          <canvas id="successRateChart"></canvas>
        </div>
      </div>

      <!-- 페르소나 테이블 -->
      <div class="table-card">
        <div class="chart-title">👥 페르소나 상세 정보</div>
        <table>
          <thead>
            <tr>
              <th>페르소나</th>
              <th>유저 수</th>
              <th>선호 종목</th>
              <th>배팅 스타일</th>
              <th>활동 레벨</th>
              <th>평균 적중률</th>
              <th>평균 배팅액</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>야구광</strong></td>
              <td>10명</td>
              <td><span class="badge badge-info">야구</span></td>
              <td>핸디캡/일반</td>
              <td><span class="badge badge-warning">높음</span></td>
              <td>45-60%</td>
              <td>3,000-15,000원</td>
            </tr>
            <tr>
              <td><strong>농구팬</strong></td>
              <td>10명</td>
              <td><span class="badge badge-info">농구</span></td>
              <td>언오버/핸디캡</td>
              <td><span class="badge badge-warning">높음</span></td>
              <td>40-55%</td>
              <td>5,000-20,000원</td>
            </tr>
            <tr>
              <td><strong>축구팬</strong></td>
              <td>10명</td>
              <td><span class="badge badge-info">축구</span></td>
              <td>무승부/일반</td>
              <td><span class="badge badge-success">중간</span></td>
              <td>42-54%</td>
              <td>10,000-30,000원</td>
            </tr>
            <tr>
              <td><strong>올라운더</strong></td>
              <td>10명</td>
              <td><span class="badge badge-info">복합</span></td>
              <td>조합 배팅</td>
              <td><span class="badge badge-success">중간</span></td>
              <td>38-50%</td>
              <td>1,000-10,000원</td>
            </tr>
            <tr>
              <td><strong>라이트 유저</strong></td>
              <td>10명</td>
              <td><span class="badge badge-info">다양</span></td>
              <td>일반</td>
              <td><span class="badge badge-info">낮음</span></td>
              <td>35-50%</td>
              <td>1,000-5,000원</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 설정 모달 -->
  <div id="configModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">⚙️ 추천 알고리즘 설정</h2>
        <button class="close-btn" onclick="closeConfigModal()">&times;</button>
      </div>

      <form id="configForm" class="config-form">
        <div class="total-weight" id="totalWeight">
          총 가중치: <span id="totalWeightValue">0</span>
        </div>

        <h3 style="margin-top: 20px; color: #667eea;">🎯 가중치 설정</h3>
        <div class="weight-group">
          <div class="form-group">
            <label for="league_weight">리그 선호도</label>
            <input type="number" id="league_weight" name="league_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>자주 선택한 리그 가중치</small>
          </div>

          <div class="form-group">
            <label for="compe_weight">종목 선호도</label>
            <input type="number" id="compe_weight" name="compe_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>자주 선택한 종목 가중치</small>
          </div>

          <div class="form-group">
            <label for="team_weight">팀 선호도</label>
            <input type="number" id="team_weight" name="team_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>자주 선택한 팀 가중치</small>
          </div>

          <div class="form-group">
            <label for="time_weight">시간대 선호도</label>
            <input type="number" id="time_weight" name="time_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>선호 시간대 가중치</small>
          </div>

          <div class="form-group">
            <label for="day_weight">요일 선호도</label>
            <input type="number" id="day_weight" name="day_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>선호 요일 가중치</small>
          </div>

          <div class="form-group">
            <label for="recency_weight">최근성 보너스</label>
            <input type="number" id="recency_weight" name="recency_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>최근 활동 보너스</small>
          </div>

          <div class="form-group">
            <label for="accuracy_weight">유저 정확도</label>
            <input type="number" id="accuracy_weight" name="accuracy_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>유저 적중률 가중치</small>
          </div>

          <div class="form-group">
            <label for="betting_type_consistency_weight">배팅 타입 일관성</label>
            <input type="number" id="betting_type_consistency_weight" name="betting_type_consistency_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>일관된 배팅 스타일 가중치</small>
          </div>

          <div class="form-group">
            <label for="odds_preference_weight">배당률 선호도</label>
            <input type="number" id="odds_preference_weight" name="odds_preference_weight" min="0" max="100" step="1" oninput="calculateTotal()">
            <small>선호 배당률 패턴 가중치</small>
          </div>
        </div>

        <h3 style="margin-top: 20px; color: #667eea;">⚙️ 기타 설정</h3>
        <div class="weight-group">
          <div class="form-group">
            <label for="min_recommendation_score">최소 추천 점수</label>
            <input type="number" id="min_recommendation_score" name="min_recommendation_score" min="0" max="100" step="1">
            <small>이 점수 이하는 추천하지 않음</small>
          </div>

          <div class="form-group">
            <label for="max_recommendations">추천 경기 개수</label>
            <input type="number" id="max_recommendations" name="max_recommendations" min="1" max="10" step="1">
            <small>최대 추천할 경기 수</small>
          </div>

          <div class="form-group">
            <label for="recency_days">최근성 기준 일수</label>
            <input type="number" id="recency_days" name="recency_days" min="1" max="30" step="1">
            <small>최근 활동 판단 기준</small>
          </div>
        </div>

        <div class="button-group">
          <button type="button" class="btn btn-secondary" onclick="closeConfigModal()">취소</button>
          <button type="submit" class="btn btn-primary">저장</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 성공 토스트 -->
  <div id="successToast" class="success-toast">
    ✅ 알고리즘 설정이 성공적으로 업데이트되었습니다!
  </div>

  <script>
    let currentConfig = null;

    // 페이지 로드 시 데이터 가져오기
    async function loadData() {
      try {
        const response = await fetch('/api/v1/recommendations/dashboard/data');
        const data = await response.json();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        renderStats(data.stats);
        renderCharts(data);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        document.getElementById('loading').innerHTML = '❌ 데이터 로드에 실패했습니다.';
      }
    }

    function renderStats(stats) {
      const statsGrid = document.getElementById('statsGrid');
      const statItems = [
        { label: '총 영수증', value: stats.total_receipts.toLocaleString() },
        { label: '페르소나 수', value: stats.personas },
        { label: '데이터 기간', value: '6개월' },
        { label: '평균 적중률', value: stats.avg_success_rate + '%' },
        { label: '총 배팅액', value: (stats.total_betting_amount / 10000).toFixed(0) + '만원' }
      ];

      statsGrid.innerHTML = statItems.map(item => 
        '<div class="stat-card">' +
          '<div class="stat-label">' + item.label + '</div>' +
          '<div class="stat-value">' + item.value + '</div>' +
        '</div>'
      ).join('');
    }

    function renderCharts(data) {
      const commonOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 15, font: { size: 12 } }
          }
        }
      };

      // 1. 페르소나별 차트
      new Chart(document.getElementById('personaChart'), {
        type: 'bar',
        data: {
          labels: Object.keys(data.by_persona),
          datasets: [{
            label: '영수증 수',
            data: Object.values(data.by_persona),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ],
            borderWidth: 2
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      // 2. 종목별 차트
      new Chart(document.getElementById('compeChart'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(data.by_compe),
          datasets: [{
            data: Object.values(data.by_compe),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)'
            ],
            borderWidth: 3,
            borderColor: '#fff'
          }]
        },
        options: {
          ...commonOptions,
          cutout: '60%'
        }
      });

      // 3. 시간대별 차트
      new Chart(document.getElementById('timeChart'), {
        type: 'line',
        data: {
          labels: Object.keys(data.by_time || {}),
          datasets: [{
            label: '배팅 빈도',
            data: Object.values(data.by_time || {}),
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 3
          }]
        },
        options: commonOptions
      });

      // 4. 배팅 타입별 차트
      new Chart(document.getElementById('bettingTypeChart'), {
        type: 'pie',
        data: {
          labels: Object.keys(data.by_betting_type || {}),
          datasets: [{
            data: Object.values(data.by_betting_type || {}),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
              'rgba(255, 159, 64, 0.8)',
              'rgba(201, 203, 207, 0.8)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: commonOptions
      });

      // 5. 월별 차트
      new Chart(document.getElementById('monthlyChart'), {
        type: 'bar',
        data: {
          labels: Object.keys(data.by_month || {}),
          datasets: [{
            label: '생성된 영수증',
            data: Object.values(data.by_month || {}),
            backgroundColor: 'rgba(102, 126, 234, 0.7)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 2
          }]
        },
        options: commonOptions
      });

      // 6. 적중률 차트
      new Chart(document.getElementById('successRateChart'), {
        type: 'radar',
        data: {
          labels: Object.keys(data.success_rate_by_persona || {}),
          datasets: [{
            label: '평균 적중률 (%)',
            data: Object.values(data.success_rate_by_persona || {}),
            backgroundColor: 'rgba(102, 126, 234, 0.2)',
            borderColor: 'rgba(102, 126, 234, 1)',
            borderWidth: 3,
            pointRadius: 5
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            r: {
              beginAtZero: true,
              max: 100,
              ticks: { stepSize: 20 }
            }
          }
        }
      });
    }

    // 모달 열기
    async function openConfigModal() {
      try {
        const response = await fetch('/api/v1/recommendations/config');
        const result = await response.json();
        currentConfig = result.data;

        // 폼에 현재 값 채우기
        document.getElementById('league_weight').value = currentConfig.league_weight;
        document.getElementById('compe_weight').value = currentConfig.compe_weight;
        document.getElementById('team_weight').value = currentConfig.team_weight;
        document.getElementById('time_weight').value = currentConfig.time_weight;
        document.getElementById('day_weight').value = currentConfig.day_weight;
        document.getElementById('recency_weight').value = currentConfig.recency_weight;
        document.getElementById('accuracy_weight').value = currentConfig.accuracy_weight;
        document.getElementById('betting_type_consistency_weight').value = currentConfig.betting_type_consistency_weight;
        document.getElementById('odds_preference_weight').value = currentConfig.odds_preference_weight;
        document.getElementById('min_recommendation_score').value = currentConfig.min_recommendation_score;
        document.getElementById('max_recommendations').value = currentConfig.max_recommendations;
        document.getElementById('recency_days').value = currentConfig.recency_days;

        calculateTotal();
        document.getElementById('configModal').style.display = 'block';
      } catch (error) {
        console.error('설정 로드 실패:', error);
        alert('설정을 불러오는데 실패했습니다.');
      }
    }

    // 모달 닫기
    function closeConfigModal() {
      document.getElementById('configModal').style.display = 'none';
    }

    // 총 가중치 계산
    function calculateTotal() {
      const weights = [
        'league_weight',
        'compe_weight',
        'team_weight',
        'time_weight',
        'day_weight',
        'recency_weight',
        'accuracy_weight',
        'betting_type_consistency_weight',
        'odds_preference_weight'
      ];

      let total = 0;
      weights.forEach(weight => {
        const value = parseInt(document.getElementById(weight).value) || 0;
        total += value;
      });

      const totalWeightDiv = document.getElementById('totalWeight');
      const totalWeightValue = document.getElementById('totalWeightValue');
      
      totalWeightValue.textContent = total;

      // 경고 표시
      if (total > 200) {
        totalWeightDiv.classList.add('warning');
        totalWeightDiv.innerHTML = '⚠️ 총 가중치: <span id="totalWeightValue">' + total + '</span> (권장: 150 이하)';
      } else {
        totalWeightDiv.classList.remove('warning');
        totalWeightDiv.innerHTML = '총 가중치: <span id="totalWeightValue">' + total + '</span>';
      }
    }

    // 폼 제출
    document.getElementById('configForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        league_weight: parseInt(document.getElementById('league_weight').value),
        compe_weight: parseInt(document.getElementById('compe_weight').value),
        team_weight: parseInt(document.getElementById('team_weight').value),
        time_weight: parseInt(document.getElementById('time_weight').value),
        day_weight: parseInt(document.getElementById('day_weight').value),
        recency_weight: parseInt(document.getElementById('recency_weight').value),
        accuracy_weight: parseInt(document.getElementById('accuracy_weight').value),
        betting_type_consistency_weight: parseInt(document.getElementById('betting_type_consistency_weight').value),
        odds_preference_weight: parseInt(document.getElementById('odds_preference_weight').value),
        min_recommendation_score: parseInt(document.getElementById('min_recommendation_score').value),
        max_recommendations: parseInt(document.getElementById('max_recommendations').value),
        recency_days: parseInt(document.getElementById('recency_days').value),
      };

      try {
        const response = await fetch('/api/v1/recommendations/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          closeConfigModal();
          showSuccessToast();
        } else {
          alert('설정 업데이트에 실패했습니다.');
        }
      } catch (error) {
        console.error('설정 업데이트 실패:', error);
        alert('설정 업데이트에 실패했습니다.');
      }
    });

    // 성공 토스트 표시
    function showSuccessToast() {
      const toast = document.getElementById('successToast');
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 3000);
    }

    // 모달 외부 클릭시 닫기
    window.onclick = function(event) {
      const modal = document.getElementById('configModal');
      if (event.target === modal) {
        closeConfigModal();
      }
    }

    // 페이지 로드 시 데이터 가져오기
    loadData();
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}

  // ==================== 대시보드용 데이터 API ====================
  @Get('dashboard/data')
  @ApiOperation({
    summary: '📊 대시보드용 통계 데이터',
    description: '대시보드에 표시할 실제 통계 데이터를 제공합니다.'
  })
  async getDashboardData() {
    // 실제 DB에서 통계 데이터 조회
    const stats = await this.recommendationService.getDashboardStats();
    return stats;
  }


  // ==================== 알고리즘 설정 조회 ====================
  @Get('config')
  @ApiOperation({
    summary: '⚙️ 추천 알고리즘 설정 조회',
    description: '현재 활성화된 추천 알고리즘 설정을 조회합니다.',
  })
  async getConfig() {
    const config = await this.recommendationService.getConfig();
    return {
      success: true,
      data: config,
      message: '알고리즘 설정이 조회되었습니다.',
    };
  }

  // ==================== 알고리즘 설정 업데이트 ====================
  @Put('config')
  @ApiOperation({
    summary: '⚙️ 추천 알고리즘 설정 업데이트',
    description: '추천 알고리즘의 가중치 및 설정을 업데이트합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        league_weight: { type: 'number', example: 30, description: '리그 선호도 가중치' },
        compe_weight: { type: 'number', example: 25, description: '종목 선호도 가중치' },
        team_weight: { type: 'number', example: 25, description: '팀 선호도 가중치' },
        time_weight: { type: 'number', example: 10, description: '시간대 선호도 가중치' },
        day_weight: { type: 'number', example: 10, description: '요일 선호도 가중치' },
        recency_weight: { type: 'number', example: 10, description: '최근성 보너스 가중치' },
        accuracy_weight: { type: 'number', example: 20, description: '유저 정확도 가중치' },
        betting_type_consistency_weight: { type: 'number', example: 15, description: '배팅 타입 일관성 가중치' },
        odds_preference_weight: { type: 'number', example: 10, description: '배당률 선호도 가중치' },
        min_recommendation_score: { type: 'number', example: 20, description: '최소 추천 점수' },
        max_recommendations: { type: 'number', example: 5, description: '추천 경기 개수' },
        recency_days: { type: 'number', example: 7, description: '최근성 판단 기준 일수' },
      },
    },
  })
  async updateConfig(@Body() updateData: any) {
    const config = await this.recommendationService.updateConfig(updateData);
    return {
      success: true,
      data: config,
      message: '알고리즘 설정이 업데이트되었습니다.',
    };
  }


}