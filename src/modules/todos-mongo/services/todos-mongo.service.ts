// src/modules/todos-mongo/services/todos-mongo.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ClsService } from 'nestjs-cls';
import { AppClsStore } from '@/common/types/cls.type';
import { ClsStoreKey } from '@/common/constants/cls.constant';
import { getDataLoader } from '@/common/utils/dataloader.util';
import { TodosMongoRepository } from '../repositories/todos-mongo.mongodb.repository';
import { CreateTodoMongoDto } from '../dtos/create-todo-mongo.dto';
import { UpdateTodoMongoDto } from '../dtos/update-todo-mongo.dto';
import { TodoMongoDocument, TodoStatus, TodoPriority } from '../schemas/todo-mongo.schema';

@Injectable()
export class TodosMongoService {
  private readonly logger = new Logger(TodosMongoService.name);

  constructor(
    private readonly todosMongoRepository: TodosMongoRepository,
    private readonly clsService: ClsService<AppClsStore>,
  ) {}

  async create(createDto: CreateTodoMongoDto): Promise<TodoMongoDocument> {
    this.logger.log(`새로운 할 일 생성: ${createDto.title}`);
    return this.todosMongoRepository.create(createDto);
  }

  async getById(id: string): Promise<TodoMongoDocument> {
    const dataLoaders = this.clsService.get(ClsStoreKey.DATA_LOADERS);
    const todo = await getDataLoader(dataLoaders, this.todosMongoRepository).load(id);
    
    if (!todo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }
    
    return todo;
  }

  async getAll({ skip, limit }: { skip: number; limit: number }) {
    return this.todosMongoRepository.findAll({
      filter: { deletedAt: null },
      skip,
      limit,
      sort: { createdAt: -1 },
      deletedFilter: false,
    });
  }

  async getByStatus(status: TodoStatus): Promise<TodoMongoDocument[]> {
    this.logger.log(`상태별 할 일 조회: ${status}`);
    return this.todosMongoRepository.findByStatus(status);
  }

  async getByPriority(priority: TodoPriority): Promise<TodoMongoDocument[]> {
    this.logger.log(`우선순위별 할 일 조회: ${priority}`);
    return this.todosMongoRepository.findByPriority(priority);
  }

  async getFavorites(): Promise<TodoMongoDocument[]> {
    this.logger.log('즐겨찾기 할 일 조회');
    return this.todosMongoRepository.findFavorites();
  }

  async getByTag(tag: string): Promise<TodoMongoDocument[]> {
    this.logger.log(`태그별 할 일 조회: ${tag}`);
    return this.todosMongoRepository.findByTag(tag);
  }

  async getOverdueTodos(): Promise<TodoMongoDocument[]> {
    this.logger.log('기한 초과 할 일 조회');
    return this.todosMongoRepository.findOverdueTodos();
  }

  async searchByTitle(searchTerm: string): Promise<TodoMongoDocument[]> {
    this.logger.log(`제목으로 할 일 검색: ${searchTerm}`);
    return this.todosMongoRepository.searchByTitle(searchTerm);
  }

  async update(id: string, updateDto: UpdateTodoMongoDto): Promise<TodoMongoDocument> {
    this.logger.log(`할 일 업데이트: ${id}`);

    const existingTodo = await this.getById(id);
    if (!existingTodo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }

    const updatedTodo = await this.todosMongoRepository.updateById(
      new ObjectId(id), 
      updateDto
    );

    if (!updatedTodo) {
      throw new NotFoundException('할 일 업데이트에 실패했습니다.');
    }

    return updatedTodo;
  }

  async toggleFavorite(id: string): Promise<TodoMongoDocument> {
    const todo = await this.getById(id);
    
    return this.update(id, { 
      isFavorite: !todo.isFavorite 
    });
  }

  async markAsCompleted(id: string): Promise<TodoMongoDocument> {
    return this.update(id, { 
      status: TodoStatus.COMPLETED 
    });
  }

  async markAsInProgress(id: string): Promise<TodoMongoDocument> {
    return this.update(id, { 
      status: TodoStatus.IN_PROGRESS 
    });
  }

  async softDelete(id: string): Promise<TodoMongoDocument> {
    this.logger.log(`할 일 소프트 삭제: ${id}`);

    const existingTodo = await this.getById(id);
    if (!existingTodo) {
      throw new NotFoundException('할 일을 찾을 수 없습니다.');
    }

    const deletedTodo = await this.todosMongoRepository.updateById(
      new ObjectId(id), 
      { deletedAt: new Date() }
    );

    if (!deletedTodo) {
      throw new NotFoundException('할 일 삭제에 실패했습니다.');
    }

    return deletedTodo;
  }

  async getStatistics(): Promise<any> {
    this.logger.log('할 일 통계 조회');
    return this.todosMongoRepository.getStatistics();
  }

  async bulkUpdateStatus(ids: string[], status: TodoStatus): Promise<{
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

  async bulkDelete(ids: string[]): Promise<{
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