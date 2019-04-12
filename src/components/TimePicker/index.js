import React, { PureComponent } from 'react';
import moment from 'moment';
import { DatePicker } from 'antd';

class TimePicker extends PureComponent {
  /* 返回两个值之间的间隔为1的数组 */
  range = (start, end) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };

  /* 禁止选择的日期 */
  disabledDate = current =>
    // 没有处理逻辑，直接返回的简写；
    // Can not select days before today and today
    current && current > moment().endOf('day');

  /* 禁止选择的时间 */
  /* disabledDateTime = () =>
    // 没有处理逻辑，直接返回的简写；
    // 返回对象时用()包裹，防止解析成函数体
    ({
      // 禁止选择的时
      disabledHours: () => this.range(0, 24).splice(4, 20),
      // 禁止选择的分
      disabledMinutes: () => this.range(30, 60),
      // 禁止选择的秒
      disabledSeconds: () => [55, 56]
    }); */

  render() {
    // 接收Form.getFieldDecorator传递的值
    const { value } = this.props;
    // 接收Form.getFieldDecorator传递的事件
    const { onChange } = this.props;
    const format = 'YYYY-MM-DD HH:mm:ss';
    // 修改时赋初始值
    let valueAttr;
    if (value) {
      valueAttr = {
        value: moment(value, this.format),
      };
    } else {
      valueAttr = {};
    }

    return (
      <DatePicker
        format={format}
        {...valueAttr}
        onChange={onChange}
        disabledDate={this.disabledDate}
        // disabledTime={this.disabledDateTime}
        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
      />
    );
  }
}

export default TimePicker;
