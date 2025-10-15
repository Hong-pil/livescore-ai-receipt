// src/modules/betting-receipt/betting-receipt.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BettingReceiptController } from './controllers/betting-receipt.controller';
import { BettingReceiptService } from './services/betting-receipt.service';
import { BettingReceipt, BettingReceiptSchema } from './schemas/betting-receipt.schema';

@Module({
  imports: [
    // MongoDB의 betting_receipts 컬렉션 사용 준비
    MongooseModule.forFeature([
      { name: BettingReceipt.name, schema: BettingReceiptSchema }
    ]),
  ],
  controllers: [BettingReceiptController],  // 요청 받는 곳
  providers: [BettingReceiptService],       // 비즈니스 로직 처리
  exports: [BettingReceiptService],
})
export class BettingReceiptModule {}