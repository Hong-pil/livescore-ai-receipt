// src/modules/betting-receipt/services/betting-receipt.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BettingReceipt, BettingReceiptDocument } from '../schemas/betting-receipt.schema';
import { 
  CreateBettingReceiptDto, 
  UpdateBettingReceiptDto,
  BettingReceiptFilterDto 
} from '../dtos/create-betting-receipt.dto';

@Injectable()
export class BettingReceiptService {
  constructor(
    @InjectModel(BettingReceipt.name) 
    private bettingReceiptModel: Model<BettingReceiptDocument>,
  ) {}

  // 영수증 ID 생성 (RECEIPT_YYYYMMDDHHMISSXXX 형식)
  private generateReceiptId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    return `RECEIPT_${year}${month}${day}${hour}${minute}${second}${random}`;
  }

  // 베팅 영수증 생성
  async create(createBettingReceiptDto: CreateBettingReceiptDto): Promise<BettingReceipt> {
    try {
      // 베팅 금액과 예상 당첨 금액 검증
      const totalBettingAmount = createBettingReceiptDto.betting_items.reduce(
        (sum, item) => sum + item.betting_amount, 0
      );
      
      if (totalBettingAmount !== createBettingReceiptDto.total_betting_amount) {
        throw new BadRequestException('총 베팅 금액이 베팅 항목들의 합계와 일치하지 않습니다.');
      }

      // 최소 베팅 금액 검증 (각 항목별 500원 이상)
      const invalidBettingItems = createBettingReceiptDto.betting_items.filter(
        item => item.betting_amount < 500
      );
      
      if (invalidBettingItems.length > 0) {
        throw new BadRequestException('각 베팅 항목은 최소 500원 이상이어야 합니다.');
      }

      // 총 베팅 금액 최소값 검증 (500원 이상)
      if (createBettingReceiptDto.total_betting_amount < 500) {
        throw new BadRequestException('총 베팅 금액은 최소 500원 이상이어야 합니다.');
      }

      // 영수증 ID 생성 (중복 확인)
      let receiptId: string = '';
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 5) {
        receiptId = this.generateReceiptId();
        const existingReceipt = await this.bettingReceiptModel.findOne({ receipt_id: receiptId });
        if (!existingReceipt) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique || !receiptId) {
        throw new ConflictException('영수증 ID 생성에 실패했습니다. 다시 시도해 주세요.');
      }

      const bettingReceipt = new this.bettingReceiptModel({
        ...createBettingReceiptDto,
        receipt_id: receiptId,
        betting_type: createBettingReceiptDto.betting_type || 'proto',
        status: 'pending',
      });

      return await bettingReceipt.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('이미 존재하는 영수증 ID입니다.');
      }
      throw error;
    }
  }

  // 모든 영수증 조회 (필터링 및 페이징)
  async findAll(
    filterDto: BettingReceiptFilterDto,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: BettingReceipt[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: any = {};
    
    if (filterDto.user_no) {
      filter.user_no = filterDto.user_no;
    }
    
    if (filterDto.status) {
      filter.status = filterDto.status;
    }
    
    if (filterDto.betting_type) {
      filter.betting_type = filterDto.betting_type;
    }
    
    if (filterDto.start_date || filterDto.end_date) {
      filter.createdAt = {};
      if (filterDto.start_date) {
        filter.createdAt.$gte = new Date(filterDto.start_date);
      }
      if (filterDto.end_date) {
        const endDate = new Date(filterDto.end_date);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.bettingReceiptModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.bettingReceiptModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 특정 사용자의 영수증 조회
  async findByUser(
    userNo: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: BettingReceipt[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll({ user_no: userNo }, page, limit);
  }

  // 영수증 ID로 단일 조회
  async findOne(receiptId: string): Promise<BettingReceipt> {
    const bettingReceipt = await this.bettingReceiptModel
      .findOne({ receipt_id: receiptId })
      .exec();
    
    if (!bettingReceipt) {
      throw new NotFoundException(`영수증 ID ${receiptId}를 찾을 수 없습니다.`);
    }
    
    return bettingReceipt;
  }

  // MongoDB ObjectId로 단일 조회
  async findById(id: string): Promise<BettingReceipt> {
    const bettingReceipt = await this.bettingReceiptModel.findById(id).exec();
    
    if (!bettingReceipt) {
      throw new NotFoundException(`ID ${id}에 해당하는 영수증을 찾을 수 없습니다.`);
    }
    
    return bettingReceipt;
  }

  // 영수증 상태 업데이트
  async update(receiptId: string, updateBettingReceiptDto: UpdateBettingReceiptDto): Promise<BettingReceipt> {
    const bettingReceipt = await this.bettingReceiptModel
      .findOneAndUpdate(
        { receipt_id: receiptId },
        { ...updateBettingReceiptDto },
        { new: true, runValidators: true }
      )
      .exec();
    
    if (!bettingReceipt) {
      throw new NotFoundException(`영수증 ID ${receiptId}를 찾을 수 없습니다.`);
    }
    
    return bettingReceipt;
  }

  // 영수증 삭제
  async remove(receiptId: string): Promise<void> {
    const result = await this.bettingReceiptModel
      .findOneAndDelete({ receipt_id: receiptId })
      .exec();
    
    if (!result) {
      throw new NotFoundException(`영수증 ID ${receiptId}를 찾을 수 없습니다.`);
    }
  }

  // 사용자별 베팅 통계 조회
  async getUserBettingStats(userNo: string): Promise<{
    totalBets: number;
    totalBettingAmount: number;
    totalExpectedPayout: number;
    winningBets: number;
    losingBets: number;
    pendingBets: number;
    cancelledBets: number;
    winRate: number;
  }> {
    const stats = await this.bettingReceiptModel.aggregate([
      { $match: { user_no: userNo } },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalBettingAmount: { $sum: '$total_betting_amount' },
          totalExpectedPayout: { $sum: '$total_expected_payout' },
          winningBets: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] }
          },
          losingBets: {
            $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] }
          },
          pendingBets: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          cancelledBets: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalBets: 0,
      totalBettingAmount: 0,
      totalExpectedPayout: 0,
      winningBets: 0,
      losingBets: 0,
      pendingBets: 0,
      cancelledBets: 0
    };

    const completedBets = result.winningBets + result.losingBets;
    const winRate = completedBets > 0 ? (result.winningBets / completedBets) * 100 : 0;

    return {
      ...result,
      winRate: Math.round(winRate * 100) / 100 // 소수점 둘째 자리까지
    };
  }

  // 날짜별 베팅 통계 조회
  async getDailyBettingStats(startDate: string, endDate: string): Promise<any[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return await this.bettingReceiptModel.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalBets: { $sum: 1 },
          totalBettingAmount: { $sum: '$total_betting_amount' },
          totalExpectedPayout: { $sum: '$total_expected_payout' },
          protoBets: {
            $sum: { $cond: [{ $eq: ['$betting_type', 'proto'] }, 1, 0] }
          },
          realBets: {
            $sum: { $cond: [{ $eq: ['$betting_type', 'real'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  // 배당률 검증 및 당첨 금액 계산
  async validateOddsAndCalculatePayout(
    bettingAmount: number, 
    odds: string
  ): Promise<number> {
    const numericOdds = parseFloat(odds);
    
    if (isNaN(numericOdds) || numericOdds <= 0) {
      throw new BadRequestException('유효하지 않은 배당률입니다.');
    }
    
    return Math.round(bettingAmount * numericOdds);
  }

  // 베팅 영수증 상태별 조회
  async findByStatus(status: string): Promise<BettingReceipt[]> {
    return await this.bettingReceiptModel
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
  }

  // 베팅 영수증 일괄 상태 업데이트
  async bulkUpdateStatus(
    receiptIds: string[], 
    status: string
  ): Promise<{
    updated: number;
    failed: number;
  }> {
    let updated = 0;
    let failed = 0;

    for (const receiptId of receiptIds) {
      try {
        await this.update(receiptId, { status });
        updated++;
      } catch (error) {
        failed++;
      }
    }

    return { updated, failed };
  }

  // 베팅 영수증 일괄 삭제
  async bulkDelete(receiptIds: string[]): Promise<{
    deleted: number;
    failed: number;
  }> {
    let deleted = 0;
    let failed = 0;

    for (const receiptId of receiptIds) {
      try {
        await this.remove(receiptId);
        deleted++;
      } catch (error) {
        failed++;
      }
    }

    return { deleted, failed };
  }

  // 게임별 베팅 통계 조회
  async getGameBettingStats(gameId: string): Promise<{
    totalBets: number;
    totalBettingAmount: number;
    homeBets: number;
    awayBets: number;
    drawBets: number;
    homeAmount: number;
    awayAmount: number;
    drawAmount: number;
  }> {
    const stats = await this.bettingReceiptModel.aggregate([
      { $unwind: '$betting_items' },
      { $match: { 'betting_items.game_id': gameId } },
      {
        $group: {
          _id: '$betting_items.betting_type',
          count: { $sum: 1 },
          amount: { $sum: '$betting_items.betting_amount' }
        }
      }
    ]);

    const result = {
      totalBets: 0,
      totalBettingAmount: 0,
      homeBets: 0,
      awayBets: 0,
      drawBets: 0,
      homeAmount: 0,
      awayAmount: 0,
      drawAmount: 0
    };

    for (const stat of stats) {
      result.totalBets += stat.count;
      result.totalBettingAmount += stat.amount;

      switch (stat._id) {
        case 'home':
          result.homeBets = stat.count;
          result.homeAmount = stat.amount;
          break;
        case 'away':
          result.awayBets = stat.count;
          result.awayAmount = stat.amount;
          break;
        case 'draw':
          result.drawBets = stat.count;
          result.drawAmount = stat.amount;
          break;
      }
    }

    return result;
  }

  // 베팅 영수증 취소
  async cancelBettingReceipt(receiptId: string): Promise<BettingReceipt> {
    const receipt = await this.findOne(receiptId);
    
    if (receipt.status !== 'pending') {
      throw new BadRequestException('대기 중인 베팅만 취소할 수 있습니다.');
    }

    return await this.update(receiptId, { status: 'cancelled' });
  }

  // 베팅 영수증 당첨 처리
  async processBettingWin(receiptId: string): Promise<BettingReceipt> {
    const receipt = await this.findOne(receiptId);
    
    if (receipt.status !== 'pending') {
      throw new BadRequestException('대기 중인 베팅만 당첨 처리할 수 있습니다.');
    }

    return await this.update(receiptId, { status: 'won' });
  }

  // 베팅 영수증 낙첨 처리
  async processBettingLoss(receiptId: string): Promise<BettingReceipt> {
    const receipt = await this.findOne(receiptId);
    
    if (receipt.status !== 'pending') {
      throw new BadRequestException('대기 중인 베팅만 낙첨 처리할 수 있습니다.');
    }

    return await this.update(receiptId, { status: 'lost' });
  }

  // 사용자의 최근 베팅 영수증 조회
  async getRecentBettingsByUser(
    userNo: string, 
    limit: number = 10
  ): Promise<BettingReceipt[]> {
    return await this.bettingReceiptModel
      .find({ user_no: userNo })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  // 날짜 범위별 베팅 영수증 조회
  async findByDateRange(
    startDate: string, 
    endDate: string
  ): Promise<BettingReceipt[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return await this.bettingReceiptModel
      .find({
        createdAt: { $gte: start, $lte: end }
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  // 베팅 타입별 통계
  async getBettingTypeStats(): Promise<{
    proto: { count: number; amount: number };
    real: { count: number; amount: number };
  }> {
    const stats = await this.bettingReceiptModel.aggregate([
      {
        $group: {
          _id: '$betting_type',
          count: { $sum: 1 },
          amount: { $sum: '$total_betting_amount' }
        }
      }
    ]);

    const result = {
      proto: { count: 0, amount: 0 },
      real: { count: 0, amount: 0 }
    };

    for (const stat of stats) {
      if (stat._id === 'proto') {
        result.proto = { count: stat.count, amount: stat.amount };
      } else if (stat._id === 'real') {
        result.real = { count: stat.count, amount: stat.amount };
      }
    }

    return result;
  }

  // 전체 베팅 통계 요약
  async getOverallStats(): Promise<{
    totalBets: number;
    totalAmount: number;
    avgBetAmount: number;
    totalUsers: number;
    pendingBets: number;
    completedBets: number;
    winRate: number;
  }> {
    const [totalStats, userCount, statusStats] = await Promise.all([
      this.bettingReceiptModel.aggregate([
        {
          $group: {
            _id: null,
            totalBets: { $sum: 1 },
            totalAmount: { $sum: '$total_betting_amount' },
            avgBetAmount: { $avg: '$total_betting_amount' }
          }
        }
      ]),
      this.bettingReceiptModel.distinct('user_no'),
      this.bettingReceiptModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const total = totalStats[0] || { totalBets: 0, totalAmount: 0, avgBetAmount: 0 };
    const totalUsers = userCount.length;
    
    let pendingBets = 0;
    let wonBets = 0;
    let lostBets = 0;

    for (const stat of statusStats) {
      switch (stat._id) {
        case 'pending':
          pendingBets = stat.count;
          break;
        case 'won':
          wonBets = stat.count;
          break;
        case 'lost':
          lostBets = stat.count;
          break;
      }
    }

    const completedBets = wonBets + lostBets;
    const winRate = completedBets > 0 ? (wonBets / completedBets) * 100 : 0;

    return {
      totalBets: total.totalBets,
      totalAmount: total.totalAmount,
      avgBetAmount: Math.round(total.avgBetAmount || 0),
      totalUsers,
      pendingBets,
      completedBets,
      winRate: Math.round(winRate * 100) / 100
    };
  }
}