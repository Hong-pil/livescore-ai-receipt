// src/common/types/cls.type.ts
import DataLoader from 'dataloader';
import { ClsStore } from 'nestjs-cls';

export interface AppClsStore extends ClsStore {
  dataLoaders?: Map<string, DataLoader<any, any>>;
  userId?: string;
  requestId?: string;
}