// src/modules/betting-receipt/betting-receipt.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BettingReceiptController } from './controllers/betting-receipt.controller';
import { BettingReceiptService } from './services/betting-receipt.service';
import { BettingReceipt, BettingReceiptSchema } from './schemas/betting-receipt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BettingReceipt.name, schema: BettingReceiptSchema }
    ]),
  ],
  controllers: [BettingReceiptController],
  providers: [BettingReceiptService],
  exports: [BettingReceiptService],
})
export class BettingReceiptModule {}