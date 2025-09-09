// src/modules/todos-mongo/schemas/todo-mongo.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TodoMongoDocument = HydratedDocument<TodoMongo>;

export enum TodoStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TodoPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Schema({ collection: 'todos', timestamps: true })
export class TodoMongo {
  @ApiProperty({ example: 'NestJS 공부하기', description: '할 일 제목' })
  @Prop({ type: String, required: true })
  title: string;

  @ApiProperty({ example: 'MongoDB와 MySQL CRUD 구현하기', description: '할 일 상세 설명' })
  @Prop({ type: String, required: false })
  description?: string;

  @ApiProperty({ 
    example: TodoStatus.PENDING, 
    enum: TodoStatus,
    description: '할 일 상태' 
  })
  @Prop({ 
    type: String, 
    enum: Object.values(TodoStatus), 
    default: TodoStatus.PENDING 
  })
  status: TodoStatus;

  @ApiProperty({ 
    example: TodoPriority.MEDIUM, 
    enum: TodoPriority,
    description: '우선순위' 
  })
  @Prop({ 
    type: String, 
    enum: Object.values(TodoPriority), 
    default: TodoPriority.MEDIUM 
  })
  priority: TodoPriority;

  @ApiProperty({ example: new Date('2025-02-01'), description: '마감일' })
  @Prop({ type: Date, required: false })
  dueDate?: Date;

  @ApiProperty({ example: ['개발', 'NestJS'], description: '태그 목록' })
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty({ example: false, description: '즐겨찾기 여부' })
  @Prop({ type: Boolean, default: false })
  isFavorite: boolean;

  @ApiProperty({ example: new Date(), description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ example: new Date(), description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ example: new Date(), description: '삭제일시 (Soft Delete)' })
  @Prop({ type: Date, required: false })
  deletedAt?: Date;
}

export const TodoMongoSchema = SchemaFactory.createForClass(TodoMongo);