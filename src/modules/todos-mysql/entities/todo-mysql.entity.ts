// src/modules/todos-mysql/entities/todo-mysql.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

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

@Entity('todos')
export class TodoMySQL {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1, description: '할 일 ID' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ example: 'NestJS 공부하기', description: '할 일 제목' })
  title: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ example: 'MongoDB와 MySQL CRUD 구현하기', description: '할 일 상세 설명' })
  description?: string;

  @Column({
    type: 'enum',
    enum: TodoStatus,
    default: TodoStatus.PENDING,
  })
  @ApiProperty({ 
    example: TodoStatus.PENDING, 
    enum: TodoStatus,
    description: '할 일 상태' 
  })
  status: TodoStatus;

  @Column({
    type: 'enum',
    enum: TodoPriority,
    default: TodoPriority.MEDIUM,
  })
  @ApiProperty({ 
    example: TodoPriority.MEDIUM, 
    enum: TodoPriority,
    description: '우선순위' 
  })
  priority: TodoPriority;

  @Column({ type: 'datetime', nullable: true })
  @ApiProperty({ example: new Date('2025-02-01'), description: '마감일' })
  dueDate?: Date;

  @Column({ type: 'json', nullable: true })
  @ApiProperty({ example: ['개발', 'NestJS'], description: '태그 목록' })
  tags: string[];

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ example: false, description: '즐겨찾기 여부' })
  isFavorite: boolean;

  @CreateDateColumn()
  @ApiProperty({ example: new Date(), description: '생성일시' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ example: new Date(), description: '수정일시' })
  updatedAt: Date;

  @DeleteDateColumn()
  @ApiProperty({ example: new Date(), description: '삭제일시 (Soft Delete)' })
  deletedAt?: Date;
}