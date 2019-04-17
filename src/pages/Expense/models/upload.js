import { generator } from '@/services/upload';

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
