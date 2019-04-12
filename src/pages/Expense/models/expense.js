import { queryExpense, addExpense } from '@/services/expense';

export default {
  /* 这个参数来定义命名空间的名称，作用是用来保护该命名空间下的数据，不会和别的models冲突。
  在同个项目下，所有的namespace不能重复。 */
  namespace: 'expense',

  // 其中包含该models的初始值
  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  // 这里的功能是异步处理，意思是像ajax一样不刷新页面，获取数据。
  // 但是yield表示同步调用，即上边的代码处理完后，才会运行下边的代码。这里的同步和上边的异步不是一个含义。
  effects: {
    // 此处的fetch可以自行定义，比如查询可以用query，添加可以add等
    // 此处的payload参数是形参，当别的地方调用的时候，传入的值用payload来接收
    /* dispatch中type指定了调用了models命名空间为expense中effects下的*fetch(){}
       其中dispatch的第二个参数payload，就是传入当前功能的参数。 */
    // 对于call，put，select，可以在使用时填入fetch的第二个参数内
    *fetch({ payload }, { call, put }) {
      // 异步执行queryExpense方法，参数为payload
      // 形参payload是ES6解构写法，从dispatch中获取参数的dispatch属性对应的值
      const response = yield call(queryExpense, payload);
      // 调用reducers中的save方法
      yield put({
        type: 'save', // 对应save方法
        payload: response, // 参数action = {"payload" : response}
      });
    },
    *add({ payload, callback }, { call, put }) {
      yield call(addExpense, payload);
      const response = yield call(queryExpense, {});
      yield put({
        type: 'save', // 对应save方法
        payload: response, // 参数action = {"payload" : response}
      });
      if (callback) callback();
    },
  },

  // 用来保存更新state值 上面的put方法调用这里的方法
  // 这里的state是当前总的state，这里的action包含了上面传递的参数和type
  // 这里用ES6语法来更新当前state中data的值
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
