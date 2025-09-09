// src/modules/todos-mysql/dtos/update-todo-mysql.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTodoMySQLDto } from './create-todo-mysql.dto';

export class UpdateTodoMySQLDto extends PartialType(CreateTodoMySQLDto) {}