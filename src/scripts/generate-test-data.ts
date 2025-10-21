// src/scripts/generate-test-data.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BettingReceipt } from '../modules/betting-receipt/schemas/betting-receipt.schema';

// ==================== 인터페이스 정의 ====================
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
  weekly_frequency: number;  // 일주일에 평균 몇 번 배팅하는지
  avg_games_per_receipt: number;  // 한 영수증당 평균 경기 수
  betting_pattern: string;  // 설명용
}

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
    const personas: UserPersona[] = [];

    // 야구광 (10명)
    for (let i = 0; i < 10; i++) {
      personas.push({
        name: `야구광_${i + 1}`,
        user_no: `BASEBALL_FAN_${String(i + 1).padStart(3, '0')}`,
        favorite_compe: ['baseball'],
        favorite_leagues: ['NPB', 'KBO', 'MLB'],
        favorite_teams: this.randomSample(['한신', '요코하마', '소프트뱅크', '두산', 'LG', '삼성'], 2),
        betting_style: this.randomChoice<'handicap' | 'normal' | 'over_under'>(['handicap', 'normal', 'over_under']),
        activity_level: this.randomChoice<'medium' | 'heavy'>(['medium', 'heavy']),
        time_preference: ['18:00', '18:30', '19:00'],
        success_rate: 0.45 + Math.random() * 0.15,
        betting_amount_range: [3000, 15000],
        risk_profile: 'moderate',
        weekly_frequency: 8,
        avg_games_per_receipt: 2,
        betting_pattern: '야구 중심 배팅'
      });
    }

    // 농구팬 (10명)
    for (let i = 0; i < 10; i++) {
      personas.push({
        name: `농구팬_${i + 1}`,
        user_no: `BASKETBALL_FAN_${String(i + 1).padStart(3, '0')}`,
        favorite_compe: ['basketball'],
        favorite_leagues: ['NBA', 'KBL'],
        favorite_teams: this.randomSample(['레이커스', '워리어스', '서울SK', '원주DB'], 2),
        betting_style: this.randomChoice<'over_under' | 'handicap'>(['over_under', 'handicap']),
        activity_level: this.randomChoice<'medium' | 'heavy'>(['medium', 'heavy']),
        time_preference: ['09:00', '10:00', '19:00'],
        success_rate: 0.40 + Math.random() * 0.15,
        betting_amount_range: [5000, 20000],
        risk_profile: 'aggressive',
        weekly_frequency: 7,
        avg_games_per_receipt: 2,
        betting_pattern: '농구 중심 배팅'
      });
    }

    // 축구팬 (10명)
    for (let i = 0; i < 10; i++) {
      personas.push({
        name: `축구팬_${i + 1}`,
        user_no: `SOCCER_FAN_${String(i + 1).padStart(3, '0')}`,
        favorite_compe: ['soccer'],
        favorite_leagues: ['EPL', 'LaLiga', 'K리그'],
        favorite_teams: this.randomSample(['맨유', '첼시', '바르셀로나', '울산'], 2),
        betting_style: this.randomChoice<'draw' | 'normal'>(['draw', 'normal']),
        activity_level: 'medium',
        time_preference: ['23:00', '01:00'],
        success_rate: 0.42 + Math.random() * 0.12,
        betting_amount_range: [10000, 30000],
        risk_profile: 'moderate',
        weekly_frequency: 5,
        avg_games_per_receipt: 1,
        betting_pattern: '축구 중심 배팅'
      });
    }

    // 올라운더 (10명)
    for (let i = 0; i < 10; i++) {
      personas.push({
        name: `올라운더_${i + 1}`,
        user_no: `ALL_ROUNDER_${String(i + 1).padStart(3, '0')}`,
        favorite_compe: ['baseball', 'basketball', 'soccer'],
        favorite_leagues: ['NPB', 'NBA', 'EPL', 'KBO', 'KBL'],
        favorite_teams: [],
        betting_style: 'combo',
        activity_level: this.randomChoice<'light' | 'medium'>(['light', 'medium']),
        time_preference: ['18:00', '19:00', '23:00'],
        success_rate: 0.38 + Math.random() * 0.12,
        betting_amount_range: [1000, 10000],
        risk_profile: 'aggressive',
        weekly_frequency: 4,
        avg_games_per_receipt: 3,
        betting_pattern: '다종목 조합 배팅'
      });
    }

    // 라이트 유저 (10명)
    for (let i = 0; i < 10; i++) {
      personas.push({
        name: `라이트유저_${i + 1}`,
        user_no: `LIGHT_USER_${String(i + 1).padStart(3, '0')}`,
        favorite_compe: this.randomSample(['baseball', 'basketball', 'soccer'], 1),
        favorite_leagues: this.randomSample(['NPB', 'KBO', 'NBA', 'EPL'], 2),
        favorite_teams: [],
        betting_style: 'normal',
        activity_level: 'light',
        time_preference: this.randomSample(['18:00', '19:00', '23:00'], 2),
        success_rate: 0.35 + Math.random() * 0.15,
        betting_amount_range: [1000, 5000],
        risk_profile: 'conservative',
        weekly_frequency: 2,
        avg_games_per_receipt: 1,
        betting_pattern: '소액 라이트 배팅'
      });
    }

    return personas;
  }

  // ==================== 2. 경기 템플릿 생성 ====================
  private createGameTemplates(): GameTemplate[] {
    return [
      // NPB
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '한신', away_team_name: '요코하마', typical_time: '18:00', home_team_id: 'OT17915', away_team_id: 'OT17913' },
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '소프트뱅크', away_team_name: '닛폰햄', typical_time: '18:00', home_team_id: 'OT17922', away_team_id: 'OT17917' },
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '야쿠르트', away_team_name: '주니치', typical_time: '18:00', home_team_id: 'OT17912', away_team_id: 'OT17914' },
      { compe: 'baseball', league_id: 'OT141', league_name: 'NPB', home_team_name: '롯데', away_team_name: '오릭스', typical_time: '18:00', home_team_id: 'OT17916', away_team_id: 'OT17918' },
      
      // KBO
      { compe: 'baseball', league_id: 'KBO', league_name: 'KBO', home_team_name: 'LG', away_team_name: '두산', typical_time: '18:30', home_team_id: 'KBO_LG', away_team_id: 'KBO_DOOSAN' },
      { compe: 'baseball', league_id: 'KBO', league_name: 'KBO', home_team_name: '삼성', away_team_name: 'KIA', typical_time: '18:30', home_team_id: 'KBO_SS', away_team_id: 'KBO_KIA' },
      { compe: 'baseball', league_id: 'KBO', league_name: 'KBO', home_team_name: 'SSG', away_team_name: '롯데', typical_time: '18:30', home_team_id: 'KBO_SSG', away_team_id: 'KBO_LOTTE' },
      
      // NBA
      { compe: 'basketball', league_id: 'NBA', league_name: 'NBA', home_team_name: '레이커스', away_team_name: '워리어스', typical_time: '10:00', home_team_id: 'NBA_LAL', away_team_id: 'NBA_GSW' },
      { compe: 'basketball', league_id: 'NBA', league_name: 'NBA', home_team_name: '셀틱스', away_team_name: '히트', typical_time: '09:00', home_team_id: 'NBA_BOS', away_team_id: 'NBA_MIA' },
      { compe: 'basketball', league_id: 'NBA', league_name: 'NBA', home_team_name: '닉스', away_team_name: '네츠', typical_time: '09:30', home_team_id: 'NBA_NYK', away_team_id: 'NBA_BKN' },
      
      // KBL
      { compe: 'basketball', league_id: '32', league_name: 'KBL', home_team_name: '원주DB', away_team_name: '부산KCC', typical_time: '19:00', home_team_id: '3DB', away_team_id: '3KC' },
      { compe: 'basketball', league_id: '32', league_name: 'KBL', home_team_name: '서울SK', away_team_name: '창원LG', typical_time: '19:00', home_team_id: '3SK', away_team_id: '3LG' },
      
      // EPL
      { compe: 'soccer', league_id: 'EPL', league_name: 'EPL', home_team_name: '맨유', away_team_name: '첼시', typical_time: '23:00', home_team_id: 'EPL_MU', away_team_id: 'EPL_CHE' },
      { compe: 'soccer', league_id: 'EPL', league_name: 'EPL', home_team_name: '아스날', away_team_name: '리버풀', typical_time: '01:00', home_team_id: 'EPL_ARS', away_team_id: 'EPL_LIV' },
      { compe: 'soccer', league_id: 'EPL', league_name: 'EPL', home_team_name: '맨시티', away_team_name: '토트넘', typical_time: '23:30', home_team_id: 'EPL_MCI', away_team_id: 'EPL_TOT' },
    ];
  }

  // ==================== 3. 메인 생성 함수 ====================
  async generateTestData(count: number = 1000): Promise<{
    total_receipts: number;
    personas: number;
    date_range: { start: Date; end: Date };
    by_persona: Record<string, number>;
    by_compe: Record<string, number>;
  }> {
    console.log(`🎲 ${count}개의 테스트 영수증 생성 시작...`);

    const personas = this.createPersonas();
    const gameTemplates = this.createGameTemplates();
    const receipts: TestReceipt[] = [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    // 통계용
    const byPersona: Record<string, number> = {};
    const byCompe: Record<string, number> = {};

    for (let i = 0; i < count; i++) {
      const persona = this.randomChoice(personas);
      
      // 활동 레벨에 따른 스킵 확률
      if (this.shouldSkipByActivityLevel(persona.activity_level)) {
        continue;
      }

      // 랜덤 날짜 생성 (요일 고려)
      const receiptDate = this.generateReceiptDate(persona, startDate, endDate);

      // 게임 선택
      const numGames = this.determineNumGames(persona);
      const selectedGames = this.selectGamesForPersona(
        persona,
        gameTemplates,
        numGames,
        receiptDate
      );

      // 배팅 아이템 생성
      const bettingItems = this.createBettingItems(selectedGames, persona);

      // 총 배팅액
      const totalBettingAmount = this.randomInt(
        persona.betting_amount_range[0],
        persona.betting_amount_range[1]
      );

      // 총 배당률
      const totalOdds = this.calculateTotalOdds(bettingItems);

      // 적중 여부
      const status = Math.random() < persona.success_rate ? 'won' : 'lost';

      const receipt: TestReceipt = {
        user_no: persona.user_no,
        receipt_id: `RECEIPT_TEST_${Date.now()}_${i}_${this.randomInt(1000, 9999)}`,
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

      // 통계
      byPersona[persona.betting_pattern] = (byPersona[persona.betting_pattern] || 0) + 1;
      selectedGames.forEach(g => {
        byCompe[g.compe] = (byCompe[g.compe] || 0) + 1;
      });

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
      date_range: { start: startDate, end: endDate },
      by_persona: byPersona,
      by_compe: byCompe
    };
  }

  // ==================== 헬퍼 함수들 ====================
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private shouldSkipByActivityLevel(level: string): boolean {
    if (level === 'light') return Math.random() > 0.3;
    if (level === 'medium') return Math.random() > 0.6;
    return Math.random() > 0.9;
  }

  private generateReceiptDate(persona: UserPersona, start: Date, end: Date): Date {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    // 주말에 더 활발하게 배팅하도록 조정
    const dayOfWeek = date.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && Math.random() > 0.3) {
      // 주말이면 70% 확률로 유지
      return date;
    } else if (dayOfWeek >= 1 && dayOfWeek <= 5 && Math.random() > 0.7) {
      // 평일이면 30% 확률로 유지
      return date;
    } else {
      // 다시 생성
      return this.generateReceiptDate(persona, start, end);
    }
  }

  private determineNumGames(persona: UserPersona): number {
    const avg = persona.avg_games_per_receipt;
    // 정규분포처럼 평균 근처에서 변동
    const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
    return Math.max(1, Math.min(5, avg + variation));
  }

  private selectGamesForPersona(
    persona: UserPersona,
    templates: GameTemplate[],
    count: number,
    date: Date
  ): any[] {
    let filtered = templates.filter(game => 
      persona.favorite_compe.includes(game.compe) &&
      persona.favorite_leagues.includes(game.league_name)
    );

    // 선호 팀 우선
    if (persona.favorite_teams.length > 0) {
      const favoriteGames = filtered.filter(game =>
        persona.favorite_teams.includes(game.home_team_name) ||
        persona.favorite_teams.includes(game.away_team_name)
      );
      if (favoriteGames.length > 0) {
        filtered = [...favoriteGames, ...filtered];
      }
    }

    const selected = this.randomSample(filtered, count);

    return selected.map((game, idx) => ({
      game_id: `${game.league_id}_${date.getTime()}_${idx}`,
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
      state: 'I',
      state_txt: '발매중',
      handicap_score_cn: this.generateHandicap(game.compe),
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
        betting_amount: 1000, // 임시, 나중에 총액 기준으로 분배
        expected_payout: 0, // 임시
      };
    });
  }

  private determineBettingType(style: string, game: any): string {
    if (style === 'handicap') {
      return Math.random() > 0.5 ? 'handicap_home' : 'handicap_away';
    }
    if (style === 'over_under') {
      return Math.random() > 0.5 ? 'over' : 'under';
    }
    if (style === 'draw' && game.compe === 'soccer') {
      const rand = Math.random();
      if (rand < 0.3) return 'draw';
      return rand < 0.65 ? 'home' : 'away';
    }
    if (style === 'combo') {
      return this.randomChoice(['home', 'away', 'handicap_home', 'handicap_away', 'over', 'under']);
    }
    return Math.random() > 0.5 ? 'home' : 'away';
  }

  private determineSelectedTeam(type: string, game: any): string {
    if (type === 'home' || type === 'handicap_home') return game.home_team_name;
    if (type === 'away' || type === 'handicap_away') return game.away_team_name;
    if (type === 'draw') return '무승부';
    if (type === 'over') return '오버';
    if (type === 'under') return '언더';
    return game.home_team_name;
  }

  private determineOdds(type: string, game: any): string {
    if (type === 'home' || type === 'handicap_home') return game.home_bet_rt;
    if (type === 'away' || type === 'handicap_away') return game.away_bet_rt;
    if (type === 'draw') return (2.5 + Math.random() * 1.0).toFixed(2);
    return (1.8 + Math.random() * 0.4).toFixed(2);
  }

  private generateHandicap(compe: string): string {
    if (compe === 'baseball') {
      return this.randomChoice(['-1.5', '-0.5', '0.0', '+0.5', '+1.5']);
    }
    if (compe === 'basketball') {
      return this.randomChoice(['-7.5', '-5.5', '-3.5', '+3.5', '+5.5', '+7.5']);
    }
    if (compe === 'soccer') {
      return this.randomChoice(['-1.0', '-0.5', '0.0', '+0.5', '+1.0']);
    }
    return '0.0';
  }

  private generateOdds(riskProfile: string): string {
    if (riskProfile === 'conservative') {
      return (1.2 + Math.random() * 0.6).toFixed(2);
    } else if (riskProfile === 'moderate') {
      return (1.5 + Math.random() * 1.0).toFixed(2);
    } else {
      return (2.0 + Math.random() * 2.0).toFixed(2);
    }
  }

  private calculateTotalOdds(items: any[]): string {
    const total = items.reduce((acc, item) => acc * parseFloat(item.odds), 1.0);
    
    if (items.length === 1) {
      return total.toFixed(2);
    }
    
    // 2경기 이상: 소수점 1자리 (버림 후 올림)
    const floored = Math.floor(total * 100) / 100;
    const ceiled = Math.ceil(floored * 10) / 10;
    return ceiled.toFixed(1);
  }
}