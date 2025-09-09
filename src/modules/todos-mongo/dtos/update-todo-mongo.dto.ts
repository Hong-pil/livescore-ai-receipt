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