// src/modules/todos-mysql/controllers/todos-mysql.controller.ts
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
  HttpStatus,
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery,
  ApiParam,
  ApiBody 
} from '@nestjs/swagger';
import { TodosMySQLService } from '../services/todos-mysql.service';
import { CreateTodoMySQLDto } from '../dtos/create-todo-mysql.dto';
import { UpdateTodoMySQLDto } from '../dtos/update-todo-mysql.dto';
import { TodoStatus, TodoPriority } from '../entities/todo-mysql.entity';

@ApiTags('🗄️ Todos MySQL - 할 일 관리 (MySQL)')
@Controller('/api/v1/todos-mysql')
export class TodosMySQLController {
  constructor(private readonly todosMySQLService: TodosMySQLService) {}

  @Post()
  @ApiOperation({
    summary: '✅ 새 할 일 생성',
    description: '새로운 할 일을 MySQL에 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '할 일이 성공적으로 생성되었습니다.' })
  @ApiBody({ type: CreateTodoMySQLDto })
  async create(@Body() createDto: CreateTodoMySQLDto) {
    const createdTodo = await this.todosMySQLService.create(createDto);
    return {
      success: true,
      data: createdTodo,
      message: '할 일이 생성되었습니다.'
    };
  }

  @Get()
  @ApiOperation({
    summary: '📋 할 일 목록 조회',
    description: '할 일 목록을 페이지네이션으로 조회합니다.',
  })
  @ApiQuery({ name: 'skip', required: false, type: Number, default: 0 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 20 })
  async getAll(
    @Query('skip') skip: number = 0,
    @Query('limit') limit: number = 20,
  ) {
    const todos = await this.todosMySQLService.getAll(Number(skip), Number(limit));
    return {
      success: true,
      data: todos,
      message: '할 일 목록이 조회되었습니다.'
    };
  }

  @Get('statistics')
  @ApiOperation({
    summary: '📊 할 일 통계 조회',
    description: '할 일의 상태별, 우선순위별 통계를 조회합니다.',
  })
  async getStatistics() {
    const stats = await this.todosMySQLService.getStatistics();
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
  @ApiParam({ name: 'status', enum: TodoStatus })
  async getByStatus(@Param('status') status: TodoStatus) {
    const todos = await this.todosMySQLService.getByStatus(status);
    return {
      success: true,
      data: { results: todos, totalCount: todos.length },
      message: `${status} 상태의 할 일이 조회되었습니다.`
    };
  }

  @Get('priority/:priority')
  @ApiOperation({
    summary: '⚡ 우선순위별 할 일 조회',
    description: '특정 우선순위의 할 일들을 조회합니다.',
  })
  @ApiParam({ name: 'priority', enum: TodoPriority })
  async getByPriority(@Param('priority') priority: TodoPriority) {
    const todos = await this.todosMySQLService.getByPriority(priority);
    return {
      success: true,
      data: { results: todos, totalCount: todos.length },
      message: `${priority} 우선순위의 할 일이 조회되었습니다.`
    };
  }

  @Get('favorites')
  @ApiOperation({
    summary: '⭐ 즐겨찾기 할 일 조회',
    description: '즐겨찾기로 설정된 할 일들을 조회합니다.',
  })
  async getFavorites() {
    const todos = await this.todosMySQLService.getFavorites();
    return {
      success: true,
      data: { results: todos, totalCount: todos.length },
      message: '즐겨찾기 할 일이 조회되었습니다.'
    };
  }

  @Get('overdue')
  @ApiOperation({
    summary: '⏰ 기한 초과 할 일 조회',
    description: '마감일이 지난 할 일들을 조회합니다.',
  })
  async getOverdueTodos() {
    const todos = await this.todosMySQLService.getOverdueTodos();
    return {
      success: true,
      data: { results: todos, totalCount: todos.length },
      message: '기한 초과 할 일이 조회되었습니다.'
    };
  }

  @Get('search')
  @ApiOperation({
    summary: '🔍 할 일 검색',
    description: '제목으로 할 일을 검색합니다.',
  })
  @ApiQuery({ name: 'q', required: true, type: String })
  async searchByTitle(@Query('q') searchTerm: string) {
    const todos = await this.todosMySQLService.searchByTitle(searchTerm);
    return {
      success: true,
      data: { results: todos, totalCount: todos.length },
      message: `'${searchTerm}' 검색 결과입니다.`
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: '👁️ 할 일 상세 조회',
    description: '특정 할 일의 상세 정보를 조회합니다.',
  })
  @ApiParam({ name: 'id', type: Number })
  async getById(@Param('id', ParseIntPipe) id: number) {
    const todo = await this.todosMySQLService.getById(id);
    return {
      success: true,
      data: todo,
      message: '할 일 상세 정보가 조회되었습니다.'
    };
  }

  @Put(':id')
  @ApiOperation({
    summary: '✏️ 할 일 전체 수정',
    description: '할 일 정보를 전체적으로 수정합니다.',
  })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateTodoMySQLDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTodoMySQLDto,
  ) {
    const updatedTodo = await this.todosMySQLService.update(id, updateDto);
    return {
      success: true,
      data: updatedTodo,
      message: '할 일이 수정되었습니다.'
    };
  }

  @Patch(':id/favorite')
  @ApiOperation({
    summary: '⭐ 즐겨찾기 토글',
    description: '할 일의 즐겨찾기 상태를 토글합니다.',
  })
  @ApiParam({ name: 'id', type: Number })
  async toggleFavorite(@Param('id', ParseIntPipe) id: number) {
    const updatedTodo = await this.todosMySQLService.toggleFavorite(id);
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
  @ApiParam({ name: 'id', type: Number })
  async markAsCompleted(@Param('id', ParseIntPipe) id: number) {
    const updatedTodo = await this.todosMySQLService.markAsCompleted(id);
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
  @ApiParam({ name: 'id', type: Number })
  async markAsInProgress(@Param('id', ParseIntPipe) id: number) {
    const updatedTodo = await this.todosMySQLService.markAsInProgress(id);
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' } },
        status: { type: 'string', enum: Object.values(TodoStatus) }
      }
    }
  })
  async bulkUpdateStatus(@Body() body: { ids: number[]; status: TodoStatus }) {
    const result = await this.todosMySQLService.bulkUpdateStatus(body.ids, body.status);
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
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' } }
      }
    }
  })
  async bulkDelete(@Body() body: { ids: number[] }) {
    const result = await this.todosMySQLService.bulkDelete(body.ids);
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
  @ApiParam({ name: 'id', type: Number })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    const deletedTodo = await this.todosMySQLService.softDelete(id);
    return {
      success: true,
      data: deletedTodo,
      message: '할 일이 삭제되었습니다.'
    };
  }
}