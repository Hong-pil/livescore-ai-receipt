// src/modules/betting-receipt/services/recommendation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BettingReceipt, BettingReceiptDocument } from '../schemas/betting-receipt.schema';

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
}

export interface RecommendationResult {
  user_no: string;
  recommended_games: RecommendedGame[];
  analysis: {
    total_receipts: number;
    favorite_league: string;
    favorite_compe: string;
    favorite_betting_type: string;
    most_selected_team: string;
    recent_activity_days: number;
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
  ) {}

  // ==================== 메인: 경기 추천 ====================
  async getRecommendations(
    userNo: string,
    availableGames: any[], // 현재 배팅 가능한 경기 목록 (앱에서 전달)
  ): Promise<RecommendationResult> {
    this.logger.log(`유저 ${userNo}에 대한 추천 생성 시작`);

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
      return this.getDefaultRecommendations(userNo, availableGames);
    }

    // 2. 유저 패턴 분석
    const pattern = this.analyzeUserPattern(receipts);

    // 3. 현재 가능한 경기들에 점수 매기기
    const scoredGames = this.scoreGames(availableGames, pattern, receipts);

    // 4. 상위 N개 추천
    const topRecommendations = scoredGames
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 5); // 상위 5개만

    // 5. 유저 분석 요약
    const analysis = this.generateAnalysis(pattern, receipts);

    return {
      user_no: userNo,
      recommended_games: topRecommendations,
      analysis,
      generated_at: new Date(),
    };
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

  // ==================== 경기 점수 매기기 ====================
  private scoreGames(
    availableGames: any[],
    pattern: UserPattern,
    receipts: BettingReceiptDocument[],
  ): RecommendedGame[] {
    return availableGames
      .map((game) => {
        let score = 0;
        const reasons: string[] = [];

        // 1. 리그 선호도 점수 (30점)
        const leagueData = pattern.leagues.get(game.league_name);
        if (leagueData) {
          const leagueScore = Math.min(
            30,
            (leagueData.count / receipts.length) * 30 +
              leagueData.recent_count * 5,
          );
          score += leagueScore;
          if (leagueData.count > 3) {
            reasons.push(
              `${game.league_name} 리그를 ${leagueData.count}회 선택하셨습니다`,
            );
          }
        }

        // 2. 종목 선호도 점수 (25점)
        const compeData = pattern.compes.get(game.compe);
        if (compeData) {
          const compeScore = Math.min(
            25,
            (compeData.count / receipts.length) * 25 + compeData.recent_count * 4,
          );
          score += compeScore;
          if (compeData.recent_count > 2) {
            reasons.push(
              `최근 ${game.compe} 경기를 자주 선택하셨습니다`,
            );
          }
        }

        // 3. 팀 선호도 점수 (25점)
        const homeTeamData = pattern.teams.get(game.home_team_name);
        const awayTeamData = pattern.teams.get(game.away_team_name);
        
        if (homeTeamData) {
          score += Math.min(15, homeTeamData.count * 3 + homeTeamData.recent_count * 2);
          if (homeTeamData.count > 2) {
            reasons.push(`${game.home_team_name}을(를) 좋아하시는 것 같습니다`);
          }
        }
        
        if (awayTeamData) {
          score += Math.min(10, awayTeamData.count * 3 + awayTeamData.recent_count * 2);
          if (awayTeamData.count > 2) {
            reasons.push(`${game.away_team_name}을(를) 좋아하시는 것 같습니다`);
          }
        }

        // 4. 시간대 선호도 점수 (10점)
        const timeCount = pattern.time_preferences.get(game.match_time) || 0;
        if (timeCount > 0) {
          score += Math.min(10, timeCount * 2);
          if (timeCount > 3) {
            reasons.push(`${game.match_time} 시간대 경기를 선호하십니다`);
          }
        }

        // 5. 요일 선호도 점수 (10점)
        const dayOfWeek = new Date(game.match_date).toLocaleDateString('ko-KR', {
          weekday: 'short',
        });
        const dayCount = pattern.day_preferences.get(dayOfWeek) || 0;
        if (dayCount > 0) {
          score += Math.min(10, dayCount * 2);
        }

        // 6. 최근성 보너스 (최근 7일 내 같은 리그 선택했으면 +10점)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentSameLeague = receipts.some(
          (r) =>
            r.createdAt >= sevenDaysAgo &&
            r.selected_games.some((g: any) => g.league_name === game.league_name),
        );
        if (recentSameLeague) {
          score += 10;
          reasons.push('최근 관심을 보인 리그입니다');
        }

        // 추천 배팅 타입 결정
        const recommendedBettingType = this.determineRecommendedBettingType(
          game,
          pattern,
        );

        // 빈도 계산
        const frequency =
          (leagueData?.count || 0) +
          (homeTeamData?.count || 0) +
          (awayTeamData?.count || 0);

        const recentCount =
          (leagueData?.recent_count || 0) +
          (homeTeamData?.recent_count || 0) +
          (awayTeamData?.recent_count || 0);

        return {
          game_id: game.game_id,
          game_no: game.game_no,
          league_name: game.league_name,
          league_id: game.league_id,
          compe: game.compe,
          home_team_name: game.home_team_name,
          away_team_name: game.away_team_name,
          match_date: game.match_date,
          match_time: game.match_time,
          recommended_betting_type: recommendedBettingType,
          confidence_score: Math.min(100, Math.round(score)),
          reason: reasons.join(', ') || '새로운 경기입니다',
          frequency,
          recent_selection_count: recentCount,
        };
      })
      .filter((game) => game.confidence_score > 20); // 20점 이하는 제외
  }

  // ==================== 추천 배팅 타입 결정 ====================
  private determineRecommendedBettingType(
    game: any,
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

    return {
      total_receipts: receipts.length,
      favorite_league: favoriteLeague,
      favorite_compe: favoriteCompe,
      favorite_betting_type: favoriteBettingType,
      most_selected_team: mostSelectedTeam,
      recent_activity_days: daysDiff,
    };
  }

  // ==================== 신규 유저 기본 추천 ====================
  private getDefaultRecommendations(
    userNo: string,
    availableGames: any[],
  ): RecommendationResult {
    // 전체 유저의 인기 경기 기반으로 추천 (TODO: 나중에 구현)
    // 지금은 그냥 상위 3개만 랜덤 추천
    const randomGames = availableGames
      .slice(0, 3)
      .map((game) => ({
        game_id: game.game_id,
        game_no: game.game_no,
        league_name: game.league_name,
        league_id: game.league_id,
        compe: game.compe,
        home_team_name: game.home_team_name,
        away_team_name: game.away_team_name,
        match_date: game.match_date,
        match_time: game.match_time,
        recommended_betting_type: 'home',
        confidence_score: 50,
        reason: '인기 경기입니다',
        frequency: 0,
        recent_selection_count: 0,
      }));

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
}