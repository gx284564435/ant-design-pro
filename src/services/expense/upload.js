import request from '@/utils/request';

/**
 *  通过账单生成消费明细
 */
export async function generator(params) {
  return request('/api/expense/generator', {
    method: 'POST',
    body: params,
  });
}

/**
 *  添加/修改账单
 */
export async function addExpense(params) {
  return request('/api/expense', {
    method: 'POST',
    body: params,
  });
}
