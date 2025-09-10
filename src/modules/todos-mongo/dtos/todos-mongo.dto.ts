// src/modules/todos-mongo/dtos/todos-mongo.dto.ts
import { generateResponse } from '@/common/utils/response.util';
import { TodoMongo } from '../schemas/todo-mongo.schema';

export class TodosMongoResponse extends generateResponse(TodoMongo) {}
export class TodoMongoResponse extends generateResponse(TodoMongo) {}