// src/modules/todos-mongo/controllers/todos-mongo.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  Query,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { TodosMongoService } from '../services/todos-mongo.service';
import { CreateTodoMongoDto, CreateTodoMongoResponse } from '../dtos/create-todo-mongo.dto';
import { UpdateTodoMongoDto, UpdateTodoMongoResponse } from '../dtos/update-todo-mongo.dto';
import { TodosMongoResponse, TodoMongoResponse } from '../dtos/todos-mongo.dto';
import { TodoStatus, TodoPriority } from '../schemas/todo-mongo.schema';

@ApiTags('📝 Todos MongoDB - 할 일 관리 (MongoDB)')
@Controller('/api/v1/todos-mongo')
export class TodosMongoController {
  constructor(private readonly todosMongoService: TodosMongoService) {}

  @Post()
  @ApiOperation({
    summary: '✅ 새 할 일 생성',
    description: '새로운 할 일을 MongoDB에 생성합니다.',
  })
  @ApiResponse({ 
    status: 201, 
    description: '할 일이 성공적으로 생성되었습니다.',
    type: CreateTodoMongoResponse
  })
  @ApiBody({ 
    type: CreateTodoMongoDto,
    examples: {
      basicTodo: {
        summary: '기본 할 일',
        value: {
          title: 'NestJS 공부하기',
          description: 'MongoDB와 MySQL CRUD 구현하기',
          priority: 'medium',
          tags: ['개발', 'NestJS']
        }
      },
      urgentTodo: {
        summary: '긴급 할 일',
        value: {
          title: '프로젝트 마감일 확인',
          description: '클라이언트 미팅 전 준비',
          status: 'in_progress',
          priority: 'urgent',
          dueDate: '2025-02-01',
          isFavorite: true,
          tags: ['업무', '긴급']
        }
      }
    }
  })
  async create(@Body() createDto: CreateTodoMongoDto) {
    const createdTodo = await this.todosMongoService.create(createDto);
    return CreateTodoMongoResponse.ok(createdTodo);
  }

  @Get()
  @ApiOperation({
    summary: '📋 할 일 목록 조회',
    description: '할 일 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일 목록이 성공적으로 조회되었습니다.',
    type: TodosMongoResponse
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    default: 0,
    description: '건너뛸 항목 수',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    default: 20,
    description: '조회할 항목 수',
  })
  async getAll(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const todos = await this.todosMongoService.getAll({ 
      skip: Number(skip), 
      limit: Number(limit) 
    });
    return TodosMongoResponse.ok(todos);
  }

  @Get('statistics')
  @ApiOperation({
    summary: '📊 할 일 통계 조회',
    description: '할 일의 상태별, 우선순위별 통계를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '통계가 성공적으로 조회되었습니다.',
  })
  async getStatistics() {
    const stats = await this.todosMongoService.getStatistics();
    return {
      success: true,
      data: stats,
      message: '할 일 통계가 조회되었습니다.'
    };
  }

  @Get('status/:status')
  @ApiOperation({
    summary: '🎯 상태별 할 일 조회',
    description: '특정 상태의 할 일들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '상태별 할 일이 성공적으로 조회되었습니다.',
  })
  @ApiParam({
    name: 'status',
    enum: TodoStatus,
    description: '할 일 상태',
    example: TodoStatus.PENDING
  })
  async getByStatus(@Param('status') status: TodoStatus) {
    const todos = await this.todosMongoService.getByStatus(status);
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get('priority/:priority')
  @ApiOperation({
    summary: '⚡ 우선순위별 할 일 조회',
    description: '특정 우선순위의 할 일들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '우선순위별 할 일이 성공적으로 조회되었습니다.',
  })
  @ApiParam({
    name: 'priority',
    enum: TodoPriority,
    description: '우선순위',
    example: TodoPriority.HIGH
  })
  async getByPriority(@Param('priority') priority: TodoPriority) {
    const todos = await this.todosMongoService.getByPriority(priority);
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get('favorites')
  @ApiOperation({
    summary: '⭐ 즐겨찾기 할 일 조회',
    description: '즐겨찾기로 설정된 할 일들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '즐겨찾기 할 일이 성공적으로 조회되었습니다.',
  })
  async getFavorites() {
    const todos = await this.todosMongoService.getFavorites();
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get('overdue')
  @ApiOperation({
    summary: '⏰ 기한 초과 할 일 조회',
    description: '마감일이 지난 할 일들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '기한 초과 할 일이 성공적으로 조회되었습니다.',
  })
  async getOverdueTodos() {
    const todos = await this.todosMongoService.getOverdueTodos();
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get('search')
  @ApiOperation({
    summary: '🔍 할 일 검색',
    description: '제목으로 할 일을 검색합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '검색이 성공적으로 완료되었습니다.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: '검색어',
    example: 'NestJS'
  })
  async searchByTitle(@Query('q') searchTerm: string) {
    const todos = await this.todosMongoService.searchByTitle(searchTerm);
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get('tag/:tag')
  @ApiOperation({
    summary: '🏷️ 태그별 할 일 조회',
    description: '특정 태그가 포함된 할 일들을 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '태그별 할 일이 성공적으로 조회되었습니다.',
  })
  @ApiParam({
    name: 'tag',
    type: String,
    description: '태그명',
    example: '개발'
  })
  async getByTag(@Param('tag') tag: string) {
    const todos = await this.todosMongoService.getByTag(tag);
    return TodosMongoResponse.ok({ results: todos, totalCount: todos.length });
  }

  @Get(':id')
  @ApiOperation({
    summary: '👁️ 할 일 상세 조회',
    description: '특정 할 일의 상세 정보를 조회합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일 상세 정보가 성공적으로 조회되었습니다.',
    type: TodoMongoResponse
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  async getById(@Param('id') id: string) {
    const todo = await this.todosMongoService.getById(id);
    return TodoMongoResponse.ok(todo);
  }

  @Put(':id')
  @ApiOperation({
    summary: '✏️ 할 일 전체 수정',
    description: '할 일 정보를 전체적으로 수정합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일이 성공적으로 수정되었습니다.',
    type: UpdateTodoMongoResponse
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateTodoMongoDto })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoMongoDto,
  ) {
    const updatedTodo = await this.todosMongoService.update(id, updateDto);
    return UpdateTodoMongoResponse.ok(updatedTodo);
  }

  @Patch(':id/favorite')
  @ApiOperation({
    summary: '⭐ 즐겨찾기 토글',
    description: '할 일의 즐겨찾기 상태를 토글합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '즐겨찾기 상태가 성공적으로 변경되었습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID',
    example: '507f1f77bcf86cd799439011'
  })
  async toggleFavorite(@Param('id') id: string) {
    const updatedTodo = await this.todosMongoService.toggleFavorite(id);
    return {
      success: true,
      data: updatedTodo,
      message: `즐겨찾기가 ${updatedTodo.isFavorite ? '추가' : '해제'}되었습니다.`
    };
  }

  @Patch(':id/complete')
  @ApiOperation({
    summary: '✅ 할 일 완료 처리',
    description: '할 일을 완료 상태로 변경합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일이 완료 처리되었습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID',
    example: '507f1f77bcf86cd799439011'
  })
  async markAsCompleted(@Param('id') id: string) {
    const updatedTodo = await this.todosMongoService.markAsCompleted(id);
    return {
      success: true,
      data: updatedTodo,
      message: '할 일이 완료되었습니다.'
    };
  }

  @Patch(':id/progress')
  @ApiOperation({
    summary: '🔄 할 일 진행중 처리',
    description: '할 일을 진행중 상태로 변경합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일이 진행중으로 변경되었습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID',
    example: '507f1f77bcf86cd799439011'
  })
  async markAsInProgress(@Param('id') id: string) {
    const updatedTodo = await this.todosMongoService.markAsInProgress(id);
    return {
      success: true,
      data: updatedTodo,
      message: '할 일이 진행중으로 변경되었습니다.'
    };
  }

  @Post('bulk/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '📦 일괄 상태 변경',
    description: '여러 할 일의 상태를 일괄적으로 변경합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '일괄 상태 변경이 완료되었습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
        },
        status: {
          type: 'string',
          enum: Object.values(TodoStatus),
          example: 'completed'
        }
      }
    }
  })
  async bulkUpdateStatus(@Body() body: { ids: string[]; status: TodoStatus }) {
    const result = await this.todosMongoService.bulkUpdateStatus(body.ids, body.status);
    return {
      success: true,
      data: result,
      message: `${result.updated}개 항목이 업데이트되었습니다. ${result.failed}개 실패.`
    };
  }

  @Delete('bulk')
  @ApiOperation({
    summary: '🗑️ 일괄 삭제',
    description: '여러 할 일을 일괄적으로 삭제합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '일괄 삭제가 완료되었습니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
        }
      }
    }
  })
  async bulkDelete(@Body() body: { ids: string[] }) {
    const result = await this.todosMongoService.bulkDelete(body.ids);
    return {
      success: true,
      data: result,
      message: `${result.deleted}개 항목이 삭제되었습니다. ${result.failed}개 실패.`
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ 할 일 삭제',
    description: '할 일을 소프트 삭제합니다.',
  })
  @ApiResponse({ 
    status: 200, 
    description: '할 일이 성공적으로 삭제되었습니다.',
  })
  @ApiParam({
    name: 'id',
    description: '할 일 ID',
    example: '507f1f77bcf86cd799439011'
  })
  async softDelete(@Param('id') id: string) {
    const deletedTodo = await this.todosMongoService.softDelete(id);
    return {
      success: true,
      data: deletedTodo,
      message: '할 일이 삭제되었습니다.'
    };
  }
}