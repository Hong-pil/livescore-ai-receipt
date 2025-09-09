// src/modules/todos-mysql/services/todos-mysql.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { TodosMySQLRepository } from '../repositories/todos-mysql.repository';
import { CreateTodoMySQLDto } from '../dtos/create-todo-mysql.dto';
import { UpdateTodoMySQLDto } from '../dtos/update-todo-mysql.dto';
import { TodoMySQL, TodoStatus, TodoPriority } from '../entities/todo-mysql.entity';

@Injectable()
export class TodosMySQLService {
  private readonly logger = new Logger(TodosMySQLService.name);

  constructor(
    private readonly todosMySQLRepository: TodosMySQLRepository,
  ) {}

  async create(createDto: CreateTodoMySQLDto): Promise<TodoMySQL> {
    this.logger.log(`새로운 할 일 생성: ${createDto.title}`);
    
    const todoData = {
      ...createDto,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
      tags: createDto.tags || [],
    };

    return this.todosMySQLRepository.create(todoData);
  }

  async getById(id: number): Promise<TodoMySQL> {
    const todo = await this.todosMySQLRepository.findById(id);
    
    if (!todo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }
    
    return todo;
  }

  async getAll(skip: number = 0, limit: number = 10): Promise<{
    results: TodoMySQL[];
    totalCount: number;
  }> {
    return this.todosMySQLRepository.findAll(skip, limit);
  }

  async getByStatus(status: TodoStatus): Promise<TodoMySQL[]> {
    this.logger.log(`상태별 할 일 조회: ${status}`);
    return this.todosMySQLRepository.findByStatus(status);
  }

  async getByPriority(priority: TodoPriority): Promise<TodoMySQL[]> {
    this.logger.log(`우선순위별 할 일 조회: ${priority}`);
    return this.todosMySQLRepository.findByPriority(priority);
  }

  async getFavorites(): Promise<TodoMySQL[]> {
    this.logger.log('즐겨찾기 할 일 조회');
    return this.todosMySQLRepository.findFavorites();
  }

  async getOverdueTodos(): Promise<TodoMySQL[]> {
    this.logger.log('기한 초과 할 일 조회');
    return this.todosMySQLRepository.findOverdueTodos();
  }

  async searchByTitle(searchTerm: string): Promise<TodoMySQL[]> {
    this.logger.log(`제목으로 할 일 검색: ${searchTerm}`);
    return this.todosMySQLRepository.searchByTitle(searchTerm);
  }

  async update(id: number, updateDto: UpdateTodoMySQLDto): Promise<TodoMySQL> {
    this.logger.log(`할 일 업데이트: ${id}`);

    // 존재 여부 확인
    await this.getById(id);

    const updateData = {
      ...updateDto,
      dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
    };

    const updatedTodo = await this.todosMySQLRepository.update(id, updateData);

    if (!updatedTodo) {
      throw new NotFoundException('할 일 업데이트에 실패했습니다.');
    }

    return updatedTodo;
  }

  async toggleFavorite(id: number): Promise<TodoMySQL> {
    const todo = await this.getById(id);
    
    return this.update(id, { 
      isFavorite: !todo.isFavorite 
    });
  }

  async markAsCompleted(id: number): Promise<TodoMySQL> {
    return this.update(id, { 
      status: TodoStatus.COMPLETED 
    });
  }

  async markAsInProgress(id: number): Promise<TodoMySQL> {
    return this.update(id, { 
      status: TodoStatus.IN_PROGRESS 
    });
  }

  async softDelete(id: number): Promise<TodoMySQL> {
    this.logger.log(`할 일 소프트 삭제: ${id}`);

    // 존재 여부 확인
    await this.getById(id);

    const deletedTodo = await this.todosMySQLRepository.softDelete(id);

    if (!deletedTodo) {
      throw new NotFoundException('할 일 삭제에 실패했습니다.');
    }

    return deletedTodo;
  }

  async hardDelete(id: number): Promise<void> {
    this.logger.log(`할 일 완전 삭제: ${id}`);

    // 존재 여부 확인
    await this.getById(id);

    await this.todosMySQLRepository.hardDelete(id);
  }

  async getStatistics(): Promise<any> {
    this.logger.log('할 일 통계 조회');
    return this.todosMySQLRepository.getStatistics();
  }

  async bulkUpdateStatus(ids: number[], status: TodoStatus): Promise<{
    updated: number;
    failed: number;
  }> {
    this.logger.log(`일괄 상태 업데이트: ${ids.length}개 항목을 ${status}로 변경`);

    let updated = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.update(id, { status });
        updated++;
      } catch (error) {
        this.logger.error(`할 일 ${id} 업데이트 실패:`, error);
        failed++;
      }
    }

    return { updated, failed };
  }

  async bulkDelete(ids: number[]): Promise<{
    deleted: number;
    failed: number;
  }> {
    this.logger.log(`일괄 삭제: ${ids.length}개 항목`);

    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.softDelete(id);
        deleted++;
      } catch (error) {
        this.logger.error(`할 일 ${id} 삭제 실패:`, error);
        failed++;
      }
    }

    return { deleted, failed };
  }
}