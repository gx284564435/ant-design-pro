import { stringify } from 'qs';
import request from '@/utils/request';

/**
 *  查询
 */
export async function queryExpense(params) {
  return request(`/api/expense/query?${stringify(params)}`);
}

/**
 *  添加
 */
export async function addExpense(params) {
  return request('/api/expense', {
    method: 'POST',
    body: params,
  });
}
