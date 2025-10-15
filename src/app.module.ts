// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosMongoModule } from './modules/todos-mongo/todos-mongo.module';
import { TodosMySQLModule } from './modules/todos-mysql/todos-mysql.module';
import { getTypeOrmConfig, getMongooseConfig } from './config/database.config';
import { BettingReceiptModule } from './modules/betting-receipt/betting-receipt.module';

@Module({
  imports: [
    // 환경변수 (.env) 읽기
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // // MySQL 연결 (TypeORM)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),

    // MongoDB 연결 (Mongoose)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongooseConfig,
      inject: [ConfigService],
    }),

    // 모듈들
    TodosMongoModule,
    TodosMySQLModule,
    BettingReceiptModule,   // 베팅 영수증 모듈 등록
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}