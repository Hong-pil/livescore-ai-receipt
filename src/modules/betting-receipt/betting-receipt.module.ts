// src/modules/betting-receipt/betting-receipt.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BettingReceiptController } from './controllers/betting-receipt.controller';
import { RecommendationController } from './controllers/recommendation.controller';
import { BettingReceiptService } from './services/betting-receipt.service';
import { RecommendationService } from './services/recommendation.service';
import { BettingReceipt, BettingReceiptSchema } from './schemas/betting-receipt.schema';

@Module({
  imports: [
    // MongoDB의 betting_receipts 컬렉션 사용 준비
    // Schema: MongoDB에 저장될 데이터 형식 정의
    MongooseModule.forFeature([
      { name: BettingReceipt.name, schema: BettingReceiptSchema }
    ]),
  ],
  controllers: [
    BettingReceiptController,
    RecommendationController
  ],  // 요청 받는 곳
    
  providers: [
    BettingReceiptService,
    RecommendationService
  ],       // 비즈니스 로직 처리
  exports: [
    BettingReceiptService,
    RecommendationService
  ],
})
export class BettingReceiptModule {}