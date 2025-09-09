// src/modules/todos-mysql/todos-mysql.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodosMySQLController } from './controllers/todos-mysql.controller';
import { TodosMySQLService } from './services/todos-mysql.service';
import { TodosMySQLRepository } from './repositories/todos-mysql.repository';
import { TodoMySQL } from './entities/todo-mysql.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TodoMySQL]),
  ],
  controllers: [TodosMySQLController],
  providers: [TodosMySQLService, TodosMySQLRepository],
  exports: [TodosMySQLService],
})
export class TodosMySQLModule {}