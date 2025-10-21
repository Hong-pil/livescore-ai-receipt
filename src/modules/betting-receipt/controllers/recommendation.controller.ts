// src/modules/betting-receipt/controllers/recommendation.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
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

    h1 {
      color: white;
      text-align: center;
      margin-bottom: 30px;
      font-size: 2.5em;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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

    @media (max-width: 768px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 1.8em;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 베팅 영수증 테스트 데이터 분석 대시보드</h1>

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

  <script>
    // 실제 데이터 로드
    async function loadData() {
      try {
        const response = await fetch('/api/v1/recommendations/dashboard/data');
        const data = await response.json();

        // 로딩 숨기고 콘텐츠 표시
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        // 통계 카드 렌더링
        renderStats(data.stats);

        // 차트 렌더링
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
}