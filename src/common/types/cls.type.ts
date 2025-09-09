// src/common/types/cls.type.ts
import DataLoader from 'dataloader';

export interface AppClsStore {
  dataLoaders?: Map<string, DataLoader<any, any>>;
  userId?: string;
  requestId?: string;
}