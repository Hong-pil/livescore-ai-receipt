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

export class CreateTodoMongoResponse extends generateResponse(TodoMongo) {}