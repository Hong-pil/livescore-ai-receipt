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
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM (MySQL) 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),

    // Mongoose (MongoDB) 설정
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongooseConfig,
      inject: [ConfigService],
    }),

    // 모듈들
    TodosMongoModule,
    TodosMySQLModule,
    BettingReceiptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}