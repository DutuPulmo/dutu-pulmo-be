import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

/**
 * @param queryBuilder Base SelectQueryBuilder của TypeORM
 * @param dto Object chứa page, limit, sort, order từ request
 * @param allowedSortFields Danh sách các field được phép sort (tránh SQL injection)
 * @param defaultSortField Field mặc định sẽ dùng để sort nếu client không truyền
 * @param defaultSortOrder Chiều sort mặc định nếu client không truyền
 */
export function applyPaginationAndSort<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  dto: PaginationDto,
  allowedSortFields: string[],
  defaultSortField: string = 'createdAt',
  defaultSortOrder: 'ASC' | 'DESC' = 'DESC',
): SelectQueryBuilder<T> {
  const { page = 1, limit = 10, sort, order } = dto;

  const alias = queryBuilder.alias;

  if (sort && allowedSortFields.includes(sort)) {
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`${alias}.${sort}`, sortOrder);
  } else if (defaultSortField) {
    const orderByField = defaultSortField.includes('.')
      ? defaultSortField
      : `${alias}.${defaultSortField}`;

    queryBuilder.orderBy(orderByField, defaultSortOrder);
  }

  const skip = (page - 1) * limit;
  queryBuilder.skip(skip).take(limit);

  return queryBuilder;
}
