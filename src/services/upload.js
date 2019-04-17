import request from '@/utils/request';

/**
 *  通过账单生成消费明细
 */
export default async function generator(params) {
  return request('/api/expense/generator', {
    method: 'POST',
    body: params,
  });
}
