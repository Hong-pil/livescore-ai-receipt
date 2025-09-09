// src/common/utils/dataloader.util.ts
import DataLoader from 'dataloader';
import { CommonMongodbRepository } from '../mongoose/common-mongodb.repository';

export function getDataLoader<T>(
  dataLoaders: Map<string, DataLoader<any, any>>,
  repository: CommonMongodbRepository<T>,
  key: string = repository.constructor.name,
): DataLoader<string, T> {
  if (!dataLoaders.has(key)) {
    const loader = new DataLoader<string, T>(async (ids: readonly string[]) => {
      const items = await repository.findByIds(ids as string[]);
      const itemMap = new Map(items.map(item => [item._id.toString(), item]));
      return ids.map(id => itemMap.get(id) || null);
    });
    dataLoaders.set(key, loader);
  }
  return dataLoaders.get(key);
}