// src/modules/betting-receipt/services/recommendation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BettingReceipt, BettingReceiptDocument } from '../schemas/betting-receipt.schema';
import { RecommendationConfig, RecommendationConfigDocument } from '../schemas/recommendation-config.schema';
import { GameDto } from '../dtos/create-betting-receipt.dto';

// ==================== 추천 결과 인터페이스 ====================
interface RecommendedGame {
  game_id: string;
  game_no: string;
  league_name: string;
  league_id: string;
  compe: string;
  home_team_name: string;
  away_team_name: string;
  match_date: string;
  match_time: string;
  recommended_betting_type: string; // 'home', 'away', 'draw', 'handicap_home', 'handicap_away'
  confidence_score: number; // 0-100 점수
  reason: string; // 추천 이유
  frequency: number; // 과거 선택 빈도
  recent_selection_count: number; // 최근 선택 횟수
  success_rate?: number; // 적중률 (나중에 구현)
  // ⭐ GameDto의 모든 필드 추가
  [key: string]: any; // GameDto의 나머지 필드들을 포함하기 위한 인덱스 시그니처
}

export interface RecommendationResult {
  user_no: string;
  //recommended_games: RecommendedGame[];
  recommended_games: GameDto[]; // ⭐ GameDto[] 타입으로 변경
  analysis: {
    total_receipts: number;
    favorite_league: string;
    favorite_compe: string;
    favorite_betting_type: string;
    most_selected_team: string;
    recent_activity_days: number;
    user_accuracy: number;  // 추가
  };
  generated_at: Date;
}

// ==================== 유저 배팅 패턴 분석 ====================
interface UserPattern {
  // 리그별 선택 빈도
  leagues: Map<string, { count: number; recent_count: number }>;
  
  // 종목별 선택 빈도
  compes: Map<string, { count: number; recent_count: number }>;
  
  // 팀별 선택 빈도
  teams: Map<string, { count: number; recent_count: number; league: string }>;
  
  // 배팅 타입별 선택 빈도
  betting_types: Map<string, { count: number; recent_count: number }>;
  
  // 시간대별 선호도
  time_preferences: Map<string, number>; // "18:00" -> count
  
  // 요일별 선호도
  day_preferences: Map<string, number>; // "월" -> count
  
  // 조합 패턴 (종목 조합)
  compe_combinations: Map<string, number>; // "baseball+basketball" -> count
}

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    @InjectModel(BettingReceipt.name)
    private bettingReceiptModel: Model<BettingReceiptDocument>,
    @InjectModel(RecommendationConfig.name)
    private recommendationConfigModel: Model<RecommendationConfigDocument>,
  ) {}

  // ==================== 설정 관리 ====================
  async getConfig(): Promise<RecommendationConfig> {
    let config = await this.recommendationConfigModel.findOne({ is_active: true }).exec();
    
    if (!config) {
      // 기본 설정 생성
      config = await this.recommendationConfigModel.create({
        league_weight: 30,
        compe_weight: 25,
        team_weight: 25,
        time_weight: 10,
        day_weight: 10,
        recency_weight: 10,
        accuracy_weight: 20,
        betting_type_consistency_weight: 15,
        odds_preference_weight: 10,
        min_recommendation_score: 20,
        max_recommendations: 5,
        recency_days: 7,
        version: 'v1.1',
        is_active: true,
      });
    }
    
    return config;
  }

  async updateConfig(updateData: Partial<RecommendationConfig>): Promise<RecommendationConfig> {
  // 가중치 합계 검증 (선택사항)
  if (updateData.league_weight !== undefined || 
      updateData.compe_weight !== undefined ||
      updateData.team_weight !== undefined ||
      updateData.time_weight !== undefined ||
      updateData.day_weight !== undefined ||
      updateData.recency_weight !== undefined ||
      updateData.accuracy_weight !== undefined ||
      updateData.betting_type_consistency_weight !== undefined ||
      updateData.odds_preference_weight !== undefined) {
    
    const config = await this.getConfig();
    const totalWeight = 
      (updateData.league_weight ?? config.league_weight) +
      (updateData.compe_weight ?? config.compe_weight) +
      (updateData.team_weight ?? config.team_weight) +
      (updateData.time_weight ?? config.time_weight) +
      (updateData.day_weight ?? config.day_weight) +
      (updateData.recency_weight ?? config.recency_weight) +
      (updateData.accuracy_weight ?? config.accuracy_weight) +
      (updateData.betting_type_consistency_weight ?? config.betting_type_consistency_weight) +
      (updateData.odds_preference_weight ?? config.odds_preference_weight);

    this.logger.log(`총 가중치: ${totalWeight}`);
  }

  // is_active: true인 설정을 찾아서 업데이트
  const updatedConfig = await this.recommendationConfigModel.findOneAndUpdate(
    { is_active: true },
    { $set: updateData },
    { new: true, runValidators: true, upsert: false }
  ).exec();

  if (!updatedConfig) {
    // 설정이 없으면 새로 생성
    const newConfig = await this.recommendationConfigModel.create({
      ...updateData,
      is_active: true,
      version: updateData.version || 'v1.1',
    });
    return newConfig;
  }

  return updatedConfig;
}

  // ==================== 메인: 경기 추천 ====================
  async getRecommendations(
  userNo: string,
  availableGames: GameDto[],
): Promise<RecommendationResult> {
  this.logger.log(`유저 ${userNo}에 대한 추천 생성 시작`);

  // 설정 가져오기
  const config = await this.getConfig();

  // 1. 유저의 과거 배팅 이력 조회 (최근 6개월)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const receipts = await this.bettingReceiptModel
    .find({
      user_no: userNo,
      createdAt: { $gte: sixMonthsAgo },
    })
    .sort({ createdAt: -1 })
    .exec();

  if (receipts.length === 0) {
    this.logger.warn(`유저 ${userNo}의 배팅 이력이 없습니다.`);
    return this.getDefaultRecommendations(userNo, availableGames, config);
  }

  // 2. 유저 패턴 분석
  const pattern = this.analyzeUserPattern(receipts);

  // 3. 유저 정확도 계산
  const userAccuracy = this.calculateUserAccuracy(receipts);

  // 4. 현재 가능한 경기들에 점수 매기기
  const scoredGames = this.scoreGames(availableGames, pattern, receipts, userAccuracy, config);

  // 5. 상위 N개 추천
  const topRecommendations = scoredGames
    .filter(game => game.confidence_score >= config.min_recommendation_score)
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, config.max_recommendations);

  // 6. 유저 분석 요약 (수정: 이미 user_accuracy가 포함되어 있음)
  const analysis = this.generateAnalysis(pattern, receipts);

  return {
    user_no: userNo,
    recommended_games: topRecommendations,
    analysis, // 이미 user_accuracy 포함됨
    generated_at: new Date(),
  };
}

  // ==================== 유저 정확도 계산 ====================
  private calculateUserAccuracy(receipts: BettingReceiptDocument[]): number {
    if (receipts.length === 0) return 0;

    const completedReceipts = receipts.filter(r => 
      r.status === 'won' || r.status === 'lost'
    );

    if (completedReceipts.length === 0) return 0;

    const wonCount = completedReceipts.filter(r => r.status === 'won').length;
    return wonCount / completedReceipts.length;
  }

  // ==================== 유저 패턴 분석 ====================
  private analyzeUserPattern(receipts: BettingReceiptDocument[]): UserPattern {
    const pattern: UserPattern = {
      leagues: new Map(),
      compes: new Map(),
      teams: new Map(),
      betting_types: new Map(),
      time_preferences: new Map(),
      day_preferences: new Map(),
      compe_combinations: new Map(),
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    receipts.forEach((receipt) => {
      const isRecent = receipt.createdAt >= thirtyDaysAgo;

      // 각 영수증의 선택된 경기들 분석
      receipt.selected_games.forEach((game: any) => {
        // 리그 분석
        const leagueData = pattern.leagues.get(game.league_name) || {
          count: 0,
          recent_count: 0,
        };
        leagueData.count++;
        if (isRecent) leagueData.recent_count++;
        pattern.leagues.set(game.league_name, leagueData);

        // 종목 분석
        const compeData = pattern.compes.get(game.compe) || {
          count: 0,
          recent_count: 0,
        };
        compeData.count++;
        if (isRecent) compeData.recent_count++;
        pattern.compes.set(game.compe, compeData);

        // 홈팀 분석
        const homeTeamData = pattern.teams.get(game.home_team_name) || {
          count: 0,
          recent_count: 0,
          league: game.league_name,
        };
        homeTeamData.count++;
        if (isRecent) homeTeamData.recent_count++;
        pattern.teams.set(game.home_team_name, homeTeamData);

        // 원정팀 분석
        const awayTeamData = pattern.teams.get(game.away_team_name) || {
          count: 0,
          recent_count: 0,
          league: game.league_name,
        };
        awayTeamData.count++;
        if (isRecent) awayTeamData.recent_count++;
        pattern.teams.set(game.away_team_name, awayTeamData);

        // 시간대 선호도
        const timeCount = pattern.time_preferences.get(game.match_time) || 0;
        pattern.time_preferences.set(game.match_time, timeCount + 1);

        // 요일 선호도
        const dayOfWeek = new Date(game.match_date).toLocaleDateString('ko-KR', {
          weekday: 'short',
        });
        const dayCount = pattern.day_preferences.get(dayOfWeek) || 0;
        pattern.day_preferences.set(dayOfWeek, dayCount + 1);
      });

      // 배팅 아이템 분석
      receipt.betting_items.forEach((item: any) => {
        const bettingTypeData = pattern.betting_types.get(item.betting_type) || {
          count: 0,
          recent_count: 0,
        };
        bettingTypeData.count++;
        if (isRecent) bettingTypeData.recent_count++;
        pattern.betting_types.set(item.betting_type, bettingTypeData);
      });

      // 종목 조합 분석 (한 영수증에 포함된 종목들)
      const compesInReceipt = [
        ...new Set(receipt.selected_games.map((g: any) => g.compe)),
      ];
      if (compesInReceipt.length > 1) {
        const comboKey = compesInReceipt.sort().join('+');
        const comboCount = pattern.compe_combinations.get(comboKey) || 0;
        pattern.compe_combinations.set(comboKey, comboCount + 1);
      }
    });

    return pattern;
  }

  // ==================== 경기 점수 매기기 (수정) ====================
  /**
   * [추천 알고리즘 설정 항목]
   * 
   * 개요
   * - 현재 추천 시스템은 규칙 기반(Rule-based)알고리즘으로, 사용자의 과거 6개월 배팅 이력을 분석하여 개인화된 경기를 추천한다.
   * 
   * 🎲 1. 가중치 항목 (Scoring Weights)
        1️⃣ 리그 선호도 (league_weight: 30점)
        역할:
        - 사용자가 자주 선택한 리그(예: NPB, KBO, EPL)에 높은 점수 부여
        - 리그별 선택 빈도와 최근 선택 횟수를 분석
        필요한 이유:
        - 사용자는 특정 리그에 대한 관심도가 높음 (예: 야구팬 → NPB/KBO)
        - 익숙한 리그는 정보 접근성이 높아 배팅 의사결정이 용이
        계산 방식:
        - 리그 점수 = Min(30, (리그 선택 횟수 / 총 영수증 수) × 30 + 최근 선택 횟수 × 5)
        실제 예시:
        - 사용자가 NPB를 100회 중 40회 선택 → 점수: (40/100) × 30 + 최근 5회 × 5 = 37점 (최대 30점)

        2️⃣ 종목 선호도 (compe_weight: 25점)
        역할:
        - 사용자가 선호하는 스포츠 종목(야구, 농구, 축구) 분석
        - 종목별 선택 패턴 추적
        필요한 이유:
        - 종목마다 경기 규칙, 배당 방식이 다름
        - 사용자는 특정 종목에 대한 전문성이 높음
        계산 방식:
        - 종목 점수 = Min(25, (종목 선택 횟수 / 총 영수증 수) × 25 + 최근 선택 횟수 × 4)
        실제 예시:
        - 야구광: 야구 80%, 농구 15%, 축구 5% → 야구 경기에 높은 점수

        3️⃣ 팀 선호도 (team_weight: 25점)
        역할:
        - 사용자가 자주 선택하는 특정 팀 분석
        - 홈팀/원정팀 각각 분석 (홈팀 60%, 원정팀 40% 배분)
        필요한 이유:
        - 팬심 기반 배팅 패턴 존재 (예: 특정 팀 열성팬)
        - 팀별 전략, 선수 정보에 익숙함
        계산 방식:
        - 홈팀 점수 = Min(15, 홈팀 선택 횟수 × 3 + 최근 선택 횟수 × 2)
        - 원정팀 점수 = Min(10, 원정팀 선택 횟수 × 3 + 최근 선택 횟수 × 2)
        실제 예시:
        - 한신 타이거스를 20회 선택 → 한신 경기 추천 시 높은 점수

        4️⃣ 시간대 선호도 (time_weight: 10점)
        역할:
        - 사용자가 주로 배팅하는 시간대 분석 (18:00, 19:00, 23:00 등)
        - 생활 패턴 반영
        필요한 이유:
        - 직장인: 저녁 시간대 배팅 선호
        - 야간형: 심야 경기 배팅 활발
        - 시청 가능한 시간대 = 관심 높은 경기
        계산 방식:
        - 시간대 점수 = Min(10, 해당 시간대 선택 횟수 × 2)
        실제 예시:
        - 18:00 경기를 15회 선택 → 18:00 경기 추천 시 10점 (만점)

        5️⃣ 요일 선호도 (day_weight: 10점)
        역할:
        - 사용자가 주로 배팅하는 요일 분석
        - 주중/주말 패턴 차이 반영
        필요한 이유:
        - 주말: 활동량 증가, 여유 시간 많음
        - 특정 요일 경기 선호 (예: 금요일 야구)
        계산 방식:
        - 요일 점수 = Min(10, 해당 요일 선택 횟수 × 2)
        실제 예시:
        - 토요일 배팅 20회, 월요일 5회 → 토요일 경기에 더 높은 점수

        6️⃣ 최근성 보너스 (recency_weight: 10점)
        역할:
        - 최근 N일(기본 7일) 내 선택한 리그에 보너스 점수
        - "현재 관심사" 반영
        필요한 이유:
        - 사용자 관심사는 시간에 따라 변화
        - 최근 활동이 현재 선호도를 더 잘 반영
        - 시즌/이벤트에 따른 일시적 관심 포착
        계산 방식:
        if (최근 7일 내 동일 리그 선택) {
          보너스 점수 = 10점
          이유 추가 = "최근 관심 리그"
        }
        실제 예시:
        - 3일 전에 NPB 경기 배팅 → 오늘 NPB 경기 추천 시 +10점

        7️⃣ 유저 정확도 (accuracy_weight: 20점) ⭐ 신규
        역할:
        - 사용자의 과거 적중률을 점수에 반영
        - 적중률이 높은 사용자 = 신뢰도 높은 선택
        필요한 이유:
        - 정확도 높은 유저의 선택 패턴이 더 가치 있음
        - "잘 맞추는 유저"의 선호도에 더 높은 가중치 부여
        - 운이 아닌 실력 기반 패턴 강화
        계산 방식:
        - 적중률 = 적중 횟수 / 완료된 배팅 횟수
        - 정확도 점수 = 적중률 × 20
        실제 예시:
        - 적중률 60% → 0.6 × 20 = 12점
        - 적중률 30% → 0.3 × 20 = 6점

        8️⃣ 배팅 타입 일관성 (betting_type_consistency_weight: 15점) ⭐ 신규
        역할:
        - 사용자가 일관되게 사용하는 배팅 타입 분석
        - 핸디캡, 언더오버, 승무패 등 선호 스타일 파악
        필요한 이유:
        - 사용자마다 선호하는 배팅 전략이 다름
        - 일관된 스타일 = 해당 방식에 익숙함
        - 무작위 선택보다 전략적 선택 우선
        계산 방식:
        - 배팅 타입 점수 = Min(15, (해당 타입 선택 횟수 / 총 영수증 수) × 15)
        실제 예시:
        - 핸디캡을 100회 중 60회 사용 → 핸디캡 추천 시 9점
        - 승무패를 100회 중 80회 사용 → 승무패 추천 시 12점

        9️⃣ 배당률 선호도 (odds_preference_weight: 10점) ⭐ 신규
        역할:
        - 사용자가 선호하는 배당률 범위 분석
        - 평균 배당률과의 차이를 점수에 반영
        필요한 이유:
        - 보수적 유저: 낮은 배당(1.3~1.8) 선호 → 안정적 수익
        - 공격적 유저: 높은 배당(2.5~4.0) 선호 → 고위험 고수익
        - 배당률 스타일 불일치 시 거부감
        계산 방식:
        - 평균 배당률 = 과거 선택 배당률 총합 / 영수증 수
        - 배당률 차이 = |경기 배당률 - 평균 배당률|
        - 배당률 점수 = Max(0, 10 - 배당률 차이 × 2)
        실제 예시:
        - 평균 배당률 2.0 선호, 현재 경기 배당 2.1 → 차이 0.1 → 점수 9.8점
        - 평균 배당률 2.0 선호, 현재 경기 배당 4.0 → 차이 2.0 → 점수 6점

   * ⚙️ 2. 시스템 설정 항목
        🎯 최소 추천 점수 (min_recommendation_score: 20점)
        역할:
        - 이 점수 이하 경기는 추천 목록에서 제외
        - 품질 관리 필터
        필요한 이유:
        - 관련성 낮은 경기 제외
        - 사용자에게 의미 있는 추천만 제공
        - 추천 신뢰도 유지
        조정 가이드:
        - 낮게 설정 (10~15): 더 많은 경기 추천 (다양성 ↑)
        - 높게 설정 (25~30): 엄선된 경기만 추천 (정확도 ↑)

        📊 추천 경기 개수 (max_recommendations: 5개)
        역할:
        - 한 번에 추천할 최대 경기 수
        - UX 최적화
        필요한 이유:
        - 너무 많으면: 선택 피로도 증가
        - 너무 적으면: 선택지 부족
        - 5개 = 적절한 균형점
        조정 가이드:
        - 3개: 엄선된 추천 (모바일 최적화)
        - 5~7개: 적절한 다양성
        - 10개: 최대 선택지 제공

        📅 최근성 기준 일수 (recency_days: 7일)
        역할:
        - "최근"의 기준 정의
        - 최근성 보너스 적용 범위
        필요한 이유:
        - 너무 짧으면: 최근 활동 놓침
        - 너무 길면: "최근"의 의미 퇴색
        - 7일 = 일주일 단위 활동 패턴 포착
        조정 가이드:
        - 3일: 매우 최근 관심사만 반영
        - 7일: 주간 패턴 반영 (권장)
        - 14~30일: 중장기 트렌드 반영


   * 🎨 3. 실제 추천 시나리오
        시나리오 A: 
        야구광 유저 (적중률 55%)
        리그: NPB 40회 선택 → 30점
        종목: 야구 80% → 20점
        팀: 한신 15회 → 12점
        시간: 18:00 선호 → 10점
        요일: 토요일 → 8점
        최근성: 3일 전 NPB → 10점
        정확도: 55% → 11점
        배팅타입: 핸디캡 60% → 9점
        배당률: 평균 2.2 (현재 2.3) → 9.8점
        ----------------------------------
        총점: 119.8점 / 155점 = 77% 신뢰도 ✅ 강력 추천

        시나리오 B: 
        라이트 유저 (적중률 35%)
        리그: 다양하게 선택 → 10점
        종목: 혼합 → 8점
        팀: 특정 선호 없음 → 3점
        시간: 랜덤 → 2점
        요일: 주말만 → 4점
        최근성: 없음 → 0점
        정확도: 35% → 7점
        배팅타입: 불규칙 → 3점
        배당률: 편차 큼 → 4점
        ----------------------------------
        총점: 41점 / 155점 = 26% 신뢰도 ⚠️ 약한 추천


   * 📈 4. 알고리즘 조정 전략
        상황별 가중치 조정
        | 상황 | 조정 방향 | 이유 |
        |------|----------|------|
        | 신규 유저 많음 | `accuracy_weight` ↓ (10점) | 이력 부족으로 정확도 무의미 |
        | 시즌 시작 | `recency_weight` ↑ (15점) | 최근 관심사가 더 중요 |
        | 정확도 높은 유저 많음 | `accuracy_weight` ↑ (30점) | 실력 기반 추천 강화 |
        | 다양성 필요 | `min_recommendation_score` ↓ (15점) | 더 많은 경기 노출 |

   * 🎯 5. 핵심 메시지 (발표용)
        Why? (왜 이 항목들이 필요한가?)
        1. **개인화**: 각 사용자의 고유한 선호도 반영
        2. **정확도**: 적중률 높은 유저의 패턴 우선
        3. **시의성**: 최근 관심사 중점 반영
        4. **일관성**: 익숙한 배팅 스타일 제안
        5. **유연성**: 실시간 가중치 조정 가능
        How? (어떻게 작동하는가?)
        사용자 이력 분석
        → 9개 요소별 점수 계산 
        → 가중치 적용하여 총점 산출
        → 최소 점수 이상만 필터링
        → 상위 N개 추천
   * 차별점
        ✅ 데이터 기반: 6개월 실제 배팅 이력 분석
        ✅ 정확도 반영: 단순 빈도가 아닌 적중률 고려
        ✅ 다차원 분석: 9개 독립 요소 종합 평가
   * 
   */
  private scoreGames(
    availableGames: GameDto[],
    pattern: UserPattern,
    receipts: BettingReceiptDocument[],
    userAccuracy: number,
    config: RecommendationConfig,
  //): RecommendedGame[] {
  ): any[] { // ⭐ RecommendedGame[] 대신 any[] 사용
    return availableGames.map((game) => {
      let score = 0;
      const reasons: string[] = [];

      // 1. 리그 선호도 점수 - Optional chaining 추가
      const leagueData = pattern.leagues.get(game.league_name || '');
      if (leagueData) {
        const leagueScore = Math.min(
          config.league_weight,
          (leagueData.count / receipts.length) * config.league_weight +
            leagueData.recent_count * 5,
        );
        score += leagueScore;
        if (leagueData.count > 3) {
          reasons.push(`${game.league_name} 리그를 ${leagueData.count}회 선택`);
        }
      }

      // 2. 종목 선호도 점수
      const compeData = pattern.compes.get(game.compe || '');
      if (compeData) {
        const compeScore = Math.min(
          config.compe_weight,
          (compeData.count / receipts.length) * config.compe_weight + compeData.recent_count * 4,
        );
        score += compeScore;
        if (compeData.recent_count > 2) {
          reasons.push(`최근 ${game.compe} 경기를 자주 선택`);
        }
      }

      // 3. 팀 선호도 점수
      const homeTeamData = pattern.teams.get(game.home_team_name || '');
      const awayTeamData = pattern.teams.get(game.away_team_name || '');
      
      if (homeTeamData) {
        score += Math.min(config.team_weight * 0.6, homeTeamData.count * 3 + homeTeamData.recent_count * 2);
        if (homeTeamData.count > 2) {
          reasons.push(`${game.home_team_name} 선호`);
        }
      }
      
      if (awayTeamData) {
        score += Math.min(config.team_weight * 0.4, awayTeamData.count * 3 + awayTeamData.recent_count * 2);
        if (awayTeamData.count > 2) {
          reasons.push(`${game.away_team_name} 선호`);
        }
      }

      // 4. 시간대 선호도 점수
      const timeCount = pattern.time_preferences.get(game.match_time || '') || 0;
      if (timeCount > 0) {
        score += Math.min(config.time_weight, timeCount * 2);
        if (timeCount > 3) {
          reasons.push(`${game.match_time} 시간대 선호`);
        }
      }

      // 5. 요일 선호도 점수
      const dayOfWeek = new Date(game.match_date || new Date()).toLocaleDateString('ko-KR', {
        weekday: 'short',
      });
      const dayCount = pattern.day_preferences.get(dayOfWeek) || 0;
      if (dayCount > 0) {
        score += Math.min(config.day_weight, dayCount * 2);
      }

      // 6. 최근성 보너스
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - config.recency_days);
      const recentSameLeague = receipts.some(
        (r) =>
          r.createdAt >= recentDate &&
          r.selected_games.some((g: any) => g.league_name === (game.league_name || '')),
      );
      if (recentSameLeague) {
        score += config.recency_weight;
        reasons.push('최근 관심 리그');
      }

      // 7. 유저 정확도 보너스 (높은 정확도일수록 높은 점수)
      score += userAccuracy * config.accuracy_weight;
      if (userAccuracy > 0.5) {
        reasons.push(`적중률 ${Math.round(userAccuracy * 100)}%`);
      }

      // 8. 배팅 타입 일관성
      const recommendedBettingType = this.determineRecommendedBettingType(game, pattern);
      const bettingTypeData = pattern.betting_types.get(recommendedBettingType);
      if (bettingTypeData) {
        score += Math.min(
          config.betting_type_consistency_weight,
          (bettingTypeData.count / receipts.length) * config.betting_type_consistency_weight
        );
      }

      // 9. 배당률 선호도 (평균 배당률 분석)
      const avgOdds = this.calculateAverageOdds(receipts);
      const gameOdds = parseFloat(game.home_bet_rt || '1.5');
      const oddsDiff = Math.abs(gameOdds - avgOdds);
      const oddsScore = Math.max(0, config.odds_preference_weight - oddsDiff * 2);
      score += oddsScore;

      const frequency =
        (leagueData?.count || 0) +
        (homeTeamData?.count || 0) +
        (awayTeamData?.count || 0);

      const recentCount =
        (leagueData?.recent_count || 0) +
        (homeTeamData?.recent_count || 0) +
        (awayTeamData?.recent_count || 0);

      // ⭐ 기존 game 객체를 그대로 반환하되, 추가 필드만 추가
      return {
        ...game, // ⭐ GameDto의 모든 필드 유지
        // game_id: game.game_id || '',
        // game_no: game.game_no || '',
        // league_name: game.league_name || '',
        // league_id: game.league_id || '',
        // compe: game.compe || '',
        // home_team_name: game.home_team_name || '',
        // away_team_name: game.away_team_name || '',
        // match_date: game.match_date || '',
        // match_time: game.match_time || '',
        recommended_betting_type: recommendedBettingType,
        confidence_score: Math.min(100, Math.round(score)),
        reason: reasons.join(', ') || '새로운 경기',
        frequency,
        recent_selection_count: recentCount,
      };
    });
  }

  // ==================== 평균 배당률 계산 ====================
  private calculateAverageOdds(receipts: BettingReceiptDocument[]): number {
    if (receipts.length === 0) return 2.0;

    const totalOdds = receipts.reduce((sum, receipt) => {
      return sum + parseFloat(receipt.total_odds || '2.0');
    }, 0);

    return totalOdds / receipts.length;
  }

  // ==================== 추천 배팅 타입 결정 ====================
  private determineRecommendedBettingType(
    game: GameDto,
    pattern: UserPattern,
  ): string {
    // 유저가 가장 자주 사용하는 배팅 타입 찾기
    let maxCount = 0;
    let preferredType = 'home'; // 기본값

    pattern.betting_types.forEach((data, type) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        preferredType = type;
      }
    });

    // 핸디캡을 선호하면 핸디캡 추천
    if (preferredType.includes('handicap')) {
      // 홈팀 핸디캡이 마이너스면 홈팀이 강한 거니까 handicap_home
      const handicap = parseFloat(game.handicap_score_cn || '0');
      return handicap < 0 ? 'handicap_home' : 'handicap_away';
    }

    // 무승부를 선호하면 무승부
    if (preferredType === 'draw') {
      return 'draw';
    }

    // 기본은 홈/원정 중 배당률 보고 결정 (높은 배당 추천)
    const homeOdds = parseFloat(game.home_bet_rt || '1');
    const awayOdds = parseFloat(game.away_bet_rt || '1');
    
    return homeOdds > awayOdds ? 'home' : 'away';
  }

  // ==================== 분석 요약 생성 ====================
  private generateAnalysis(
  pattern: UserPattern,
  receipts: BettingReceiptDocument[],
): RecommendationResult['analysis'] {
  // 가장 많이 선택한 리그
  let favoriteLeague = '';
  let maxLeagueCount = 0;
  pattern.leagues.forEach((data, league) => {
    if (data.count > maxLeagueCount) {
      maxLeagueCount = data.count;
      favoriteLeague = league;
    }
  });

  // 가장 많이 선택한 종목
  let favoriteCompe = '';
  let maxCompeCount = 0;
  pattern.compes.forEach((data, compe) => {
    if (data.count > maxCompeCount) {
      maxCompeCount = data.count;
      favoriteCompe = compe;
    }
  });

  // 가장 많이 사용한 배팅 타입
  let favoriteBettingType = '';
  let maxBettingTypeCount = 0;
  pattern.betting_types.forEach((data, type) => {
    if (data.count > maxBettingTypeCount) {
      maxBettingTypeCount = data.count;
      favoriteBettingType = type;
    }
  });

  // 가장 많이 선택한 팀
  let mostSelectedTeam = '';
  let maxTeamCount = 0;
  pattern.teams.forEach((data, team) => {
    if (data.count > maxTeamCount) {
      maxTeamCount = data.count;
      mostSelectedTeam = team;
    }
  });

  // 최근 활동 일수
  const oldestReceipt = receipts[receipts.length - 1];
  const newestReceipt = receipts[0];
  const daysDiff = Math.floor(
    (newestReceipt.createdAt.getTime() - oldestReceipt.createdAt.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // 유저 정확도 계산 추가
  const userAccuracy = this.calculateUserAccuracy(receipts);

  return {
    total_receipts: receipts.length,
    favorite_league: favoriteLeague,
    favorite_compe: favoriteCompe,
    favorite_betting_type: favoriteBettingType,
    most_selected_team: mostSelectedTeam,
    recent_activity_days: daysDiff,
    user_accuracy: Math.round(userAccuracy * 100), // 추가
  };
}

  // ==================== 신규 유저 기본 추천 ====================
  private getDefaultRecommendations(
    userNo: string,
    availableGames: GameDto[],
    config: RecommendationConfig,
  ): RecommendationResult {
    //const randomGames: RecommendedGame[] = availableGames
    const randomGames = availableGames
      .slice(0, config.max_recommendations)
      .map((game) => ({
        ...game, // ⭐ GameDto의 모든 필드 유지
        // game_id: game.game_id || '',
        // game_no: game.game_no || '',
        // league_name: game.league_name || '',
        // league_id: game.league_id || '',
        // compe: game.compe || '',
        // home_team_name: game.home_team_name || '',
        // away_team_name: game.away_team_name || '',
        // match_date: game.match_date || '',
        // match_time: game.match_time || '',
        recommended_betting_type: 'home',
        confidence_score: 50,
        reason: '인기 경기',
        frequency: 0,
        recent_selection_count: 0,
      }));

      console.log("idpil::: return : " + {
      user_no: userNo,
      recommended_games: randomGames,
      analysis: {
        total_receipts: 0,
        favorite_league: '-',
        favorite_compe: '-',
        favorite_betting_type: '-',
        most_selected_team: '-',
        recent_activity_days: 0,
        user_accuracy: 0,
      },
      generated_at: new Date(),
    });

    return {
      user_no: userNo,
      recommended_games: randomGames,
      analysis: {
        total_receipts: 0,
        favorite_league: '-',
        favorite_compe: '-',
        favorite_betting_type: '-',
        most_selected_team: '-',
        recent_activity_days: 0,
        user_accuracy: 0,
      },
      generated_at: new Date(),
    };
  }

  // ==================== 유저 패턴 상세 조회 (디버깅용) ====================
  async getUserPattern(userNo: string): Promise<any> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const receipts = await this.bettingReceiptModel
      .find({
        user_no: userNo,
        createdAt: { $gte: sixMonthsAgo },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (receipts.length === 0) {
      return {
        user_no: userNo,
        message: '배팅 이력이 없습니다.',
        total_receipts: 0,
      };
    }

    const pattern = this.analyzeUserPattern(receipts);

    // Map을 객체로 변환
    return {
      user_no: userNo,
      total_receipts: receipts.length,
      leagues: Object.fromEntries(pattern.leagues),
      compes: Object.fromEntries(pattern.compes),
      teams: Object.fromEntries(pattern.teams),
      betting_types: Object.fromEntries(pattern.betting_types),
      time_preferences: Object.fromEntries(pattern.time_preferences),
      day_preferences: Object.fromEntries(pattern.day_preferences),
      compe_combinations: Object.fromEntries(pattern.compe_combinations),
    };
  }


  // ==================== 대시보드용 통계 데이터 ====================
  async getDashboardStats() {
    const receipts = await this.bettingReceiptModel.find({}).exec();

    // 페르소나별 집계
    const byPersona: Record<string, number> = {};
    const byCompe: Record<string, number> = {};
    const byTime: Record<string, number> = {};
    const byBettingType: Record<string, number> = {};
    const byMonth: Record<string, number> = {};
    const successRateByPersona: Record<string, number[]> = {};

    let totalBettingAmount = 0;
    let totalWon = 0;

    receipts.forEach(receipt => {
      // 페르소나 분류 (user_no 기반)
      const personaType = this.classifyPersona(receipt.user_no);
      byPersona[personaType] = (byPersona[personaType] || 0) + 1;

      // 성공률 집계
      if (!successRateByPersona[personaType]) {
        successRateByPersona[personaType] = [];
      }
      successRateByPersona[personaType].push(receipt.status === 'won' ? 1 : 0);

      // 종목별
      receipt.selected_games.forEach((game: any) => {
        byCompe[game.compe] = (byCompe[game.compe] || 0) + 1;
        
        // 시간대별
        byTime[game.match_time] = (byTime[game.match_time] || 0) + 1;
      });

      // 배팅 타입별
      receipt.betting_items.forEach((item: any) => {
        const typeLabel = this.getBettingTypeLabel(item.betting_type);
        byBettingType[typeLabel] = (byBettingType[typeLabel] || 0) + 1;
      });

      // 월별
      const month = new Date(receipt.createdAt).toLocaleDateString('ko-KR', { month: 'long' });
      byMonth[month] = (byMonth[month] || 0) + 1;

      // 총액
      totalBettingAmount += receipt.total_betting_amount;
      if (receipt.status === 'won') totalWon++;
    });

    // 적중률 계산
    const successRateByPersonaAvg: Record<string, number> = {};
    Object.keys(successRateByPersona).forEach(persona => {
      const rates = successRateByPersona[persona];
      const avg = (rates.reduce((a, b) => a + b, 0) / rates.length) * 100;
      successRateByPersonaAvg[persona] = Math.round(avg * 10) / 10;
    });

    return {
      stats: {
        total_receipts: receipts.length,
        personas: 50,
        avg_success_rate: Math.round((totalWon / receipts.length) * 1000) / 10,
        total_betting_amount: totalBettingAmount,
      },
      by_persona: byPersona,
      by_compe: byCompe,
      by_time: byTime,
      by_betting_type: byBettingType,
      by_month: byMonth,
      success_rate_by_persona: successRateByPersonaAvg,
    };
  }

  private classifyPersona(userNo: string): string {
    if (userNo.includes('BASEBALL')) return '야구광';
    if (userNo.includes('BASKETBALL')) return '농구팬';
    if (userNo.includes('SOCCER')) return '축구팬';
    if (userNo.includes('ALL_ROUNDER')) return '올라운더';
    if (userNo.includes('LIGHT')) return '라이트유저';
    return '기타';
  }

  private getBettingTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'home': '홈승',
      'away': '원정승',
      'draw': '무승부',
      'handicap_home': '핸디캡(홈)',
      'handicap_away': '핸디캡(원정)',
      'over': '오버',
      'under': '언더',
    };
    return labels[type] || type;
  }
}