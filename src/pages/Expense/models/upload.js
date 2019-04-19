import { generator, addExpense } from '@/services/expense/upload';

export default {
  namespace: 'upload',

  state: {
    data: {
      list: [],
    },
  },

  effects: {
    *generator({ payload, callback }, { call, put }) {
      const response = yield call(generator, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *addExpense({ payload, callback }, { call }) {
      yield call(addExpense, payload);
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
