/**
 * 数组的深拷贝
 * @param obj
 * @returns {*}
 */
/* eslint-disable import/prefer-default-export */
export function deepCopy(obj) {
  // 只拷贝对象
  if (typeof obj !== 'object') return;
  // 根据obj的类型判断是新建一个数组还是一个对象
  const newObj = obj instanceof Array ? [] : {};
  /* eslint-disable no-restricted-syntax */
  for (const key in obj) {
    // 遍历obj,并且判断是obj的属性才拷贝
    /* eslint-disable no-prototype-builtins */
    if (obj.hasOwnProperty(key)) {
      // 判断属性值的类型，如果是对象递归调用深拷贝
      newObj[key] = typeof obj[key] === 'object' ? deepCopy(obj[key]) : obj[key];
    }
  }
  /* eslint-disable consistent-return */
  return newObj;
}
