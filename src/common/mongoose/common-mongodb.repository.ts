// src/common/mongoose/common-mongodb.repository.ts
import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface FindOptions {
  filter?: FilterQuery<any>;
  skip?: number;
  limit?: number;
  sort?: any;
  deletedFilter?: boolean;
}

export abstract class CommonMongodbRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  async create(createData: any): Promise<T> {
    const created = new this.model(createData);
    return created.save();
  }

  async findById(id: string | ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findByIds(ids: string[]): Promise<T[]> {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(options: FindOptions = {}): Promise<{ results: T[]; totalCount: number }> {
    const {
      filter = {},
      skip = 0,
      limit = 20,
      sort = { createdAt: -1 },
      deletedFilter = true,
    } = options;

    const finalFilter = deletedFilter ? { ...filter, deletedAt: null } : filter;

    const [results, totalCount] = await Promise.all([
      this.model.find(finalFilter).sort(sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(finalFilter),
    ]);

    return { results, totalCount };
  }

  async updateById(id: string | ObjectId, updateData: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async deleteById(id: string | ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async softDeleteById(id: string | ObjectId): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    ).exec();
  }
}