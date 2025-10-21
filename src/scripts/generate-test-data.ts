// src/scripts/generate-test-data.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BettingReceipt } from '../modules/betting-receipt/schemas/betting-receipt.schema';

// ==================== 페르소나 정의 ====================
interface UserPersona {
  name: string;
  user_no: string;
  favorite_compe: string[];
  favorite_leagues: string[];
  favorite_teams: string[];
  betting_style: 'handicap' | 'over_under' | 'draw' | 'combo' | 'normal';
  activity_level: 'light' | 'medium' | 'heavy';
  time_preference: string[];
  success_rate: number;
  betting_amount_range: [number, number];
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
}

// ==================== 실제 경기 데이터 ====================
interface GameTemplate {
  compe: string;
  league_id: string;
  league_name: string;
  home_team_name: string;
  away_team_name: string;
  typical_time: string;
  home_team_id: string;
  away_team_id: string;
}

interface TestReceipt {
  user_no: string;
  receipt_id: string;
  selected_games: any[];
  betting_items: any[];
  total_betting_amount: number;
  total_expected_payout: number;
  total_odds: string;
  status: string;
  betting_type: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TestDataGenerator {
  constructor(
    @InjectModel(BettingReceipt.name)
    private bettingReceiptModel: Model<BettingReceipt>,
  ) {}

  // ==================== 1. 페르소나 생성 ====================
  private createPersonas(): UserPersona[] {
    return [
      // 야구광 유저들 (10명)
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `야구광_${i + 1}`,
        user_no: `BASEBALL_FAN_${i + 1}`,
        favorite_compe: ['baseball'],
        favorite_leagues: ['NPB', 'KBO', 'MLB'],
        favorite_teams: this.randomSample(['한신', '요코하마', '소프트뱅크', '두산', 'LG'], 2),
        betting_style: this.randomChoice<'handicap' | 'normal' | 'over_under'>(['handicap', 'normal', 'over_under']),
        activity_level: this.randomChoice<'medium' | 'heavy'>(['medium', 'heavy']),
        time_preference: ['18:00', '19:00'],
        success_rate: 0.45 + Math.random() * 0.15, // 45-60%
        betting_amount_range: [3000, 15000] as [number, number],
        risk_profile: 'moderate' as const,
        weekly_frequency: 10,
        avg_games_per_receipt: 2,
        betting_pattern: '야구 중심 배팅'
      })),

      // 농구팬 유저들 (10명)
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `농구팬_${i + 1}`,
        user_no: `BASKETBALL_FAN_${i + 1}`,
        favorite_compe: ['basketball'],
        favorite_leagues: ['NBA', 'KBL'],
        favorite_teams: this.randomSample(['레이커스', '워리어스', '서울SK', '원주DB'], 2),
        betting_style: this.randomChoice<'over_under' | 'handicap'>(['over_under', 'handicap']),
        activity_level: this.randomChoice<'medium' | 'heavy'>(['medium', 'heavy']),
        time_preference: ['10:00', '19:00'],
        success_rate: 0.40 + Math.random() * 0.15,
        betting_amount_range: [5000, 20000] as [number, number],
        risk_profile: 'aggressive' as const,
        weekly_frequency: 8,
        avg_games_per_receipt: 2,
        betting_pattern: '농구 중심 배팅'
      })),

      // 축구팬 유저들 (10명)
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `축구팬_${i + 1}`,
        user_no: `SOCCER_FAN_${i + 1}`,
        favorite_compe: ['soccer'],
        favorite_leagues: ['EPL', 'LaLiga', 'K리그'],
        favorite_teams: this.randomSample(['맨유', '첼시', '바르셀로나', '울산'], 2),
        betting_style: this.randomChoice<'draw' | 'normal'>(['draw', 'normal']),
        activity_level: 'medium' as const,
        time_preference: ['23:00', '01:00'],
        success_rate: 0.42 + Math.random() * 0.12,
        betting_amount_range: [10000, 30000] as [number, number],
        risk_profile: 'moderate' as const,
        weekly_frequency: 6,
        avg_games_per_receipt: 1,
        betting_pattern: '축구 중심 배팅'
      })),

      // 올라운더 유저들 (10명)
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `올라운더_${i + 1}`,
        user_no: `ALL_ROUNDER_${i + 1}`,
        favorite_compe: ['baseball', 'basketball', 'soccer'],
        favorite_leagues: ['NPB', 'NBA', 'EPL'],
        favorite_teams: [] as string[],
        betting_style: 'combo' as const,
        activity_level: this.randomChoice<'light' | 'medium'>(['light', 'medium']),
        time_preference: ['18:00', '19:00', '23:00'],
        success_rate: 0.38 + Math.random() * 0.12,
        betting_amount_range: [1000, 10000] as [number, number],
        risk_profile: 'aggressive' as const,
        weekly_frequency: 5,
        avg_games_per_receipt: 3,
        betting_pattern: '다종목 조합 배팅'
      })),

      // 라이트 유저들 (10명)
      ...Array.from({ length: 10 }, (_, i) => ({
        name: `라이트유저_${i + 1}`,
        user_no: `LIGHT_USER_${i + 1}`,
        favorite_compe: this.randomSample(['baseball', 'basketball', 'soccer'], 1),
        favorite_leagues: this.randomSample(['NPB', 'KBO', 'NBA', 'EPL'], 2),
        favorite_teams: [] as string[],
        betting_style: 'normal' as const,
        activity_level: 'light' as const,
        time_preference: this.randomSample(['18:00', '19:00', '23:00'], 2),
        success_rate: 0.35 + Math.random() * 0.15,
        betting_amount_range: [1000, 5000] as [number, number],
        risk_profile: 'conservative' as const,
        weekly_frequency: 2,
        avg_games_per_receipt: 1,
        betting_pattern: '소액 라이트 배팅'
      })),
    ];
  }

  // ==================== 2. 경기 템플릿 생성 ====================
  private createGameTemplates(): GameTemplate[] {
    return [
      // NPB (일본 프로야구)
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '한신', away_team_name: '요코하마', typical_time: '18:00', home_team_id: 'OT17915', away_team_id: 'OT17913' },
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '소프트뱅크', away_team_name: '닛폰햄', typical_time: '18:00', home_team_id: 'OT17922', away_team_id: 'OT17917' },
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '야쿠르트', away_team_name: '주니치', typical_time: '18:00', home_team_id: 'OT17912', away_team_id: 'OT17914' },

      // KBO
      { compe: 'baseball', league_id: 'KBO', league_name: 'KBO', home_team_name: 'LG', away_team_name: '두산', typical_time: '18:30', home_team_id: 'KBO_LG', away_team_id: 'KBO_DOOSAN' },
      { compe: 'baseball', league_id: 'KBO', league_name: 'KBO', home_team_name: '삼성', away_team_name: 'KIA', typical_time: '18:30', home_team_id: 'KBO_SS', away_team_id: 'KBO_KIA' },

      // NBA
      { compe: 'basketball', league_id: 'NBA', league_name: 'NBA', home_team_name: '레이커스', away_team_name: '워리어스', typical_time: '10:00', home_team_id: 'NBA_LAL', away_team_id: 'NBA_GSW' },
      { compe: 'basketball', league_id: 'NBA', league_name: 'NBA', home_team_name: '셀틱스', away_team_name: '히트', typical_time: '09:00', home_team_id: 'NBA_BOS', away_team_id: 'NBA_MIA' },

      // KBL
      { compe: 'basketball', league_id: '32', league_name: 'KBL', home_team_name: '원주DB', away_team_name: '부산KCC', typical_time: '19:00', home_team_id: '3DB', away_team_id: '3KC' },
      { compe: 'basketball', league_id: '32', league_name: 'KBL', home_team_name: '서울SK', away_team_name: '창원LG', typical_time: '19:00', home_team_id: '3SK', away_team_id: '3LG' },

      // EPL
      { compe: 'soccer', league_id: 'EPL', league_name: 'EPL', home_team_name: '맨유', away_team_name: '첼시', typical_time: '23:00', home_team_id: 'EPL_MU', away_team_id: 'EPL_CHE' },
      { compe: 'soccer', league_id: 'EPL', league_name: 'EPL', home_team_name: '아스날', away_team_name: '리버풀', typical_time: '01:00', home_team_id: 'EPL_ARS', away_team_id: 'EPL_LIV' },
    ];
  }

  // ==================== 3. 영수증 생성 로직 ====================
  async generateTestData(count: number = 1000): Promise<{
    total_receipts: number;
    personas: number;
    date_range: { start: Date; end: Date };
  }> {
    console.log(`🎲 ${count}개의 테스트 영수증 생성 시작...`);

    const personas = this.createPersonas();
    const gameTemplates = this.createGameTemplates();
    const receipts: TestReceipt[] = [];

    // 6개월 전부터 오늘까지
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    for (let i = 0; i < count; i++) {
      const persona = this.randomChoice(personas);
      
      // 유저 활동 레벨에 따라 영수증 생성 빈도 결정
      const shouldSkip = this.shouldSkipByActivityLevel(persona.activity_level);
      if (shouldSkip) continue;

      // 랜덤 날짜 생성
      const receiptDate = this.randomDate(startDate, endDate);

      // 페르소나에 맞는 경기 선택 (1-5개)
      const numGames = persona.betting_style === 'combo' 
        ? this.randomInt(2, 5) 
        : this.randomInt(1, 3);

      const selectedGames = this.selectGamesForPersona(
        persona,
        gameTemplates,
        numGames,
        receiptDate
      );

      // 배팅 아이템 생성
      const bettingItems = this.createBettingItems(
        selectedGames,
        persona
      );

      // 총 배팅액 계산
      const totalBettingAmount = this.randomInt(
        persona.betting_amount_range[0],
        persona.betting_amount_range[1]
      );

      // 총 배당률 계산
      const totalOdds = bettingItems.reduce((acc: number, item: any) => 
        acc * parseFloat(item.odds), 1.0
      ).toFixed(2);

      // 적중 여부 결정 (페르소나의 success_rate 기준)
      const status = Math.random() < persona.success_rate ? 'won' : 'lost';

      const receipt: TestReceipt = {
        user_no: persona.user_no,
        receipt_id: `RECEIPT_TEST_${Date.now()}_${i}`,
        selected_games: selectedGames,
        betting_items: bettingItems,
        total_betting_amount: totalBettingAmount,
        total_expected_payout: Math.floor(totalBettingAmount * parseFloat(totalOdds)),
        total_odds: totalOdds,
        status: status,
        betting_type: 'P',
        createdAt: receiptDate,
        updatedAt: receiptDate,
      };

      receipts.push(receipt);

      if ((i + 1) % 100 === 0) {
        console.log(`✅ ${i + 1}개 생성 완료...`);
      }
    }

    // DB에 저장
    console.log(`💾 ${receipts.length}개 영수증을 DB에 저장 중...`);
    await this.bettingReceiptModel.insertMany(receipts);
    
    console.log(`🎉 완료! 총 ${receipts.length}개 영수증 생성`);
    
    return {
      total_receipts: receipts.length,
      personas: personas.length,
      date_range: { start: startDate, end: endDate }
    };
  }

  // ==================== 헬퍼 함수들 ====================
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  private shouldSkipByActivityLevel(level: string): boolean {
    if (level === 'light') return Math.random() > 0.3; // 30% 확률로 배팅
    if (level === 'medium') return Math.random() > 0.6; // 60% 확률
    return Math.random() > 0.9; // heavy: 90% 확률
  }

  private selectGamesForPersona(
    persona: UserPersona,
    templates: GameTemplate[],
    count: number,
    date: Date
  ): any[] {
    // 페르소나가 선호하는 종목/리그 필터링
    let filtered = templates.filter(game => 
      persona.favorite_compe.includes(game.compe) &&
      persona.favorite_leagues.includes(game.league_name)
    );

    // 선호 팀이 있으면 우선 선택
    if (persona.favorite_teams.length > 0) {
      const favoriteGames = filtered.filter(game =>
        persona.favorite_teams.includes(game.home_team_name) ||
        persona.favorite_teams.includes(game.away_team_name)
      );
      if (favoriteGames.length > 0) {
        filtered = favoriteGames;
      }
    }

    const selected = this.randomSample(filtered, count);

    return selected.map(game => ({
      game_id: `${game.league_id}_${Date.now()}_${Math.random()}`,
      game_no: String(this.randomInt(1, 100)).padStart(3, '0'),
      compe: game.compe,
      league_id: game.league_id,
      league_name: game.league_name,
      match_date: date.toISOString().split('T')[0],
      match_time: this.randomChoice(persona.time_preference),
      home_team_id: game.home_team_id,
      home_team_name: game.home_team_name,
      away_team_id: game.away_team_id,
      away_team_name: game.away_team_name,
      home_score: '0',
      away_score: '0',
      state: 'F',
      state_txt: '종료',
      handicap_score_cn: this.generateHandicap(),
      home_bet_rt: this.generateOdds(persona.risk_profile),
      away_bet_rt: this.generateOdds(persona.risk_profile),
      round_no: String(this.randomInt(100, 150)),
    }));
  }

  private createBettingItems(games: any[], persona: UserPersona): any[] {
    return games.map(game => {
      const bettingType = this.determineBettingType(persona.betting_style, game);
      const selectedTeam = this.determineSelectedTeam(bettingType, game);
      const odds = this.determineOdds(bettingType, game);

      return {
        game_id: game.game_id,
        betting_type: bettingType,
        selected_team: selectedTeam,
        odds: odds,
        betting_amount: this.randomInt(300, 1000),
        expected_payout: this.randomInt(500, 3000),
      };
    });
  }

  private determineBettingType(style: string, game: any): string {
    if (style === 'handicap') return Math.random() > 0.5 ? 'handicap_home' : 'handicap_away';
    if (style === 'over_under') return Math.random() > 0.5 ? 'over' : 'under';
    if (style === 'draw') return 'draw';
    if (style === 'combo') return this.randomChoice(['home', 'away', 'handicap_home', 'over']);
    return Math.random() > 0.5 ? 'home' : 'away';
  }

  private determineSelectedTeam(type: string, game: any): string {
    if (type.includes('home')) return game.home_team_name;
    if (type.includes('away')) return game.away_team_name;
    if (type === 'draw') return '무승부';
    if (type === 'over') return '오버';
    if (type === 'under') return '언더';
    return game.home_team_name;
  }

  private determineOdds(type: string, game: any): string {
    return game.home_bet_rt;
  }

  private generateHandicap(): string {
    const values = ['-3.5', '-2.5', '-1.5', '0.0', '+1.5', '+2.5'];
    return this.randomChoice(values);
  }

  private generateOdds(riskProfile: string): string {
    if (riskProfile === 'conservative') {
      return (1.2 + Math.random() * 0.6).toFixed(2); // 1.2-1.8
    } else if (riskProfile === 'moderate') {
      return (1.5 + Math.random() * 1.0).toFixed(2); // 1.5-2.5
    } else {
      return (2.0 + Math.random() * 2.0).toFixed(2); // 2.0-4.0
    }
  }
}