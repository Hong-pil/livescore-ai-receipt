// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosMongoModule } from './modules/todos-mongo/todos-mongo.module';
import { TodosMySQLModule } from './modules/todos-mysql/todos-mysql.module';
import { getTypeOrmConfig, getMongooseConfig } from './config/database.config';

@Module({
  imports: [
    // 환경변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // CLS (Context Local Storage) 설정
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls, req) => {
          cls.set('dataLoaders', new Map());
          cls.set('requestId', req.headers['x-request-id'] || Math.random().toString(36));
        },
      },
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}