// src/modules/todos-mongo/repositories/todos-mongo.mongodb.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommonMongodbRepository } from '@/common/mongoose/common-mongodb.repository';
import { TodoMongo, TodoMongoDocument, TodoStatus, TodoPriority } from '../schemas/todo-mongo.schema';

@Injectable()
export class TodosMongoRepository extends CommonMongodbRepository<TodoMongoDocument> {
  constructor(
    @InjectModel(TodoMongo.name) 
    todoModel: Model<TodoMongoDocument>
  ) {
    super(todoModel);
  }

  async findByStatus(status: TodoStatus): Promise<TodoMongoDocument[]> {
    return this.model.find({ 
      status, 
      deletedAt: null 
    }).exec();
  }

  async findByPriority(priority: TodoPriority): Promise<TodoMongoDocument[]> {
    return this.model.find({ 
      priority, 
      deletedAt: null 
    }).exec();
  }

  async findFavorites(): Promise<TodoMongoDocument[]> {
    return this.model.find({ 
      isFavorite: true, 
      deletedAt: null 
    }).exec();
  }

  async findByTag(tag: string): Promise<TodoMongoDocument[]> {
    return this.model.find({ 
      tags: tag, 
      deletedAt: null 
    }).exec();
  }

  async findOverdueTodos(): Promise<TodoMongoDocument[]> {
    const today = new Date();
    return this.model.find({
      dueDate: { $lt: today },
      status: { $ne: TodoStatus.COMPLETED },
      deletedAt: null
    }).exec();
  }

  async searchByTitle(searchTerm: string): Promise<TodoMongoDocument[]> {
    return this.model.find({
      title: { $regex: searchTerm, $options: 'i' },
      deletedAt: null
    }).exec();
  }

  async getStatistics(): Promise<any> {
    const pipeline = [
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const statusStats = await this.model.aggregate(pipeline).exec();
    
    const total = await this.model.countDocuments({ deletedAt: null });
    const favorites = await this.model.countDocuments({ isFavorite: true, deletedAt: null });
    const overdue = await this.model.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: TodoStatus.COMPLETED },
      deletedAt: null
    });

    return {
      total,
      favorites,
      overdue,
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    };
  }
}