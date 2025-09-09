// src/modules/todos-mongo/dtos/create-todo-mongo.dto.ts
import { PickType } from '@nestjs/swagger';
import { generateResponse } from '@/common/utils/response.util';
import { TodoMongo } from '../schemas/todo-mongo.schema';

export class CreateTodoMongoDto extends PickType(TodoMongo, [
  'title',
  'description',
  'status',
  'priority',
  'dueDate',
  'tags',
  'isFavorite'
] as const) {}

export class CreateTodoMongoResponse extends generateResponse(CreateTodoMongoDto) {}

// src/modules/todos-mongo/dtos/update-todo-mongo.dto.ts
import { PartialType, PickType } from '@nestjs/swagger';
import { generateResponse } from '@/common/utils/response.util';
import { TodoMongo } from '../schemas/todo-mongo.schema';

export class UpdateTodoMongoDto extends PartialType(
  PickType(TodoMongo, [
    'title',
    'description',
    'status',
    'priority',
    'dueDate',
    'tags',
    'isFavorite'
  ] as const)
) {}

export class UpdateTodoMongoResponse extends generateResponse(UpdateTodoMongoDto) {}

// src/modules/todos-mongo/dtos/todos-mongo.dto.ts
import { generateResponse } from '@/common/utils/response.util';
import { TodoMongo } from '../schemas/todo-mongo.schema';

export class TodosMongoResponse extends generateResponse([TodoMongo]) {}
export class TodoMongoResponse extends generateResponse(TodoMongo) {}

// src/modules/todos-mysql/dtos/create-todo-mysql.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { TodoStatus, TodoPriority } from '../entities/todo-mysql.entity';

export class CreateTodoMySQLDto {
  @ApiProperty({ example: 'NestJS 공부하기', description: '할 일 제목' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'MongoDB와 MySQL CRUD 구현하기', description: '할 일 상세 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: TodoStatus.PENDING, 
    enum: TodoStatus,
    description: '할 일 상태',
    required: false
  })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiProperty({ 
    example: TodoPriority.MEDIUM, 
    enum: TodoPriority,
    description: '우선순위',
    required: false
  })
  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @ApiProperty({ example: '2025-02-01', description: '마감일', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ example: ['개발', 'NestJS'], description: '태그 목록', required: false })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiProperty({ example: false, description: '즐겨찾기 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;
}

// src/modules/todos-mysql/dtos/update-todo-mysql.dto.ts
import { PartialType } from '@nestjs/swagger';

export class UpdateTodoMySQLDto extends PartialType(CreateTodoMySQLDto) {}