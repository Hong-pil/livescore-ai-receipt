// src/modules/todos-mysql/repositories/todos-mysql.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan, Not } from 'typeorm';
import { TodoMySQL, TodoStatus, TodoPriority } from '../entities/todo-mysql.entity';

@Injectable()
export class TodosMySQLRepository {
  constructor(
    @InjectRepository(TodoMySQL)
    private readonly todoRepository: Repository<TodoMySQL>
  ) {}

  async create(todoData: Partial<TodoMySQL>): Promise<TodoMySQL> {
    const todo = this.todoRepository.create(todoData);
    return this.todoRepository.save(todo);
  }

  async findAll(skip: number = 0, limit: number = 10): Promise<{
    results: TodoMySQL[];
    totalCount: number;
  }> {
    const [results, totalCount] = await this.todoRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      where: { deletedAt: null }
    });

    return { results, totalCount };
  }

  async findById(id: number): Promise<TodoMySQL | null> {
    return this.todoRepository.findOne({
      where: { id, deletedAt: null }
    });
  }

  async findByStatus(status: TodoStatus): Promise<TodoMySQL[]> {
    return this.todoRepository.find({
      where: { status, deletedAt: null },
      order: { createdAt: 'DESC' }
    });
  }

  async findByPriority(priority: TodoPriority): Promise<TodoMySQL[]> {
    return this.todoRepository.find({
      where: { priority, deletedAt: null },
      order: { createdAt: 'DESC' }
    });
  }

  async findFavorites(): Promise<TodoMySQL[]> {
    return this.todoRepository.find({
      where: { isFavorite: true, deletedAt: null },
      order: { createdAt: 'DESC' }
    });
  }

  async findOverdueTodos(): Promise<TodoMySQL[]> {
    const today = new Date();
    return this.todoRepository.find({
      where: {
        dueDate: LessThan(today),
        status: Not(TodoStatus.COMPLETED),
        deletedAt: null
      },
      order: { dueDate: 'ASC' }
    });
  }

  async searchByTitle(searchTerm: string): Promise<TodoMySQL[]> {
    return this.todoRepository.find({
      where: {
        title: Like(`%${searchTerm}%`),
        deletedAt: null
      },
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: number, updateData: Partial<TodoMySQL>): Promise<TodoMySQL | null> {
    await this.todoRepository.update(id, updateData);
    return this.findById(id);
  }

  async softDelete(id: number): Promise<TodoMySQL | null> {
    await this.todoRepository.softDelete(id);
    return this.todoRepository.findOne({
      where: { id },
      withDeleted: true
    });
  }

  async hardDelete(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }

  async getStatistics(): Promise<any> {
    const total = await this.todoRepository.count({ where: { deletedAt: null } });
    
    const statusStats = await this.todoRepository
      .createQueryBuilder('todo')
      .select('todo.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('todo.deletedAt IS NULL')
      .groupBy('todo.status')
      .getRawMany();

    const favorites = await this.todoRepository.count({
      where: { isFavorite: true, deletedAt: null }
    });

    const overdue = await this.todoRepository.count({
      where: {
        dueDate: LessThan(new Date()),
        status: Not(TodoStatus.COMPLETED),
        deletedAt: null
      }
    });

    return {
      total,
      favorites,
      overdue,
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {})
    };
  }
}