// src/common/utils/response.util.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export interface ApiResponseInterface<T> {
  success: boolean;
  data: T;
  message: string;
}

export function generateResponse<T>(dataType: Type<T>): any {
  class ResponseClass implements ApiResponseInterface<T> {
    @ApiProperty({ example: true, description: '성공 여부' })
    success: boolean;

    @ApiProperty({ type: dataType, description: '응답 데이터' })
    data: T;

    @ApiProperty({ example: '성공적으로 처리되었습니다.', description: '응답 메시지' })
    message: string;

    static ok(data: T, message: string = '성공적으로 처리되었습니다.'): ApiResponseInterface<T> {
      return {
        success: true,
        data,
        message,
      };
    }

    static error(message: string = '처리 중 오류가 발생했습니다.'): ApiResponseInterface<null> {
      return {
        success: false,
        data: null,
        message,
      };
    }
  }

  // 정적 메서드들을 직접 할당
  (ResponseClass as any).ok = ResponseClass.ok;
  (ResponseClass as any).error = ResponseClass.error;

  return ResponseClass;
}