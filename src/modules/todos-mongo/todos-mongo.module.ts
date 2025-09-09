// src/modules/todos-mongo/todos-mongo.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TodosMongoController } from './controllers/todos-mongo.controller';
import { TodosMongoService } from './services/todos-mongo.service';
import { TodosMongoRepository } from './repositories/todos-mongo.mongodb.repository';
import { TodoMongo, TodoMongoSchema } from './schemas/todo-mongo.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TodoMongo.name, schema: TodoMongoSchema }
    ]),
  ],
  controllers: [TodosMongoController],
  providers: [TodosMongoService, TodosMongoRepository],
  exports: [TodosMongoService],
})
export class TodosMongoModule {}