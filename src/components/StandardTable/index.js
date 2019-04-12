import React, { PureComponent, Fragment } from 'react';
import { Table, Alert } from 'antd';
import styles from './index.less';

/*
 * 判断每列是否要求和；needTotal属性作为判断依据
 */
function initTotalList(columns) {
  const totalList = [];
  columns.forEach(column => {
    // 列对象有needTotal属性，则该列要求和
    // column：{ title: '金额', dataIndex: 'money', needTotal: true}
    if (column.needTotal) {
      // { ...column, total: 0 }  给列对象合并total属性
      // [{ title: '金额', dataIndex: 'money', needTotal: true, total: 0},{}]
      totalList.push({ ...column, total: 0 });
    }
  });
  return totalList;
}

class StandardTable extends PureComponent {
  constructor(props) {
    super(props);
    const { columns } = props;
    const needTotalList = initTotalList(columns);

    this.state = {
      selectedRowKeys: [],
      needTotalList,
    };
  }

  static getDerivedStateFromProps(nextProps) {
    // clean state
    if (nextProps.selectedRows.length === 0) {
      const needTotalList = initTotalList(nextProps.columns);
      return {
        selectedRowKeys: [],
        needTotalList,
      };
    }
    return null;
  }

  /*
   * 表格行选中项发生变化时的回调
   * selectedRowKeys：指定选中项的 key 数组，需要和 onChange 进行配合	string[]
   * selectedRows：选中的行
   */
  handleRowSelectChange = (selectedRowKeys, selectedRows) => {
    let { needTotalList } = this.state; // 需要求和的列集合
    // 每列求选择行的值的和
    needTotalList = needTotalList.map(item => ({
      ...item, // 求和的列的列对象
      /* reduce() 方法接收一个函数作为累加器，数组中的每个值（从左到右）开始缩减，最终计算为一个值。
         array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
         function(total,currentValue, index,arr)	必需。用于执行每个数组元素的函数。
            函数参数:
             total	必需。初始值, 或者计算结束后的返回值。
             currentValue	必需。当前元素
             currentIndex	可选。当前元素的索引
             arr	可选。当前元素所属的数组对象。
          initialValue	可选。传递给函数的初始值 */
      // val：选中行的行对象
      total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex], 10), 0),
    }));
    // 调用者的列选中处理
    const { onSelectRow } = this.props;
    if (onSelectRow) {
      onSelectRow(selectedRows);
    }

    this.setState({ selectedRowKeys, needTotalList });
  };

  /*
   * 分页、排序、筛选变化时触发	Function(pagination, filters, sorter, extra: { currentDataSource: [] })
   */
  handleTableChange = (pagination, filters, sorter) => {
    // 调用者处理
    const { onChange } = this.props;
    if (onChange) {
      onChange(pagination, filters, sorter);
    }
  };

  /*
   * 清空选中行
   */
  cleanSelectedKeys = () => {
    this.handleRowSelectChange([], []);
  };

  render() {
    const { selectedRowKeys, needTotalList } = this.state;
    const { data = {}, rowKey, ...rest } = this.props;
    const { list = [], pagination } = data;

    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      ...pagination,
    };

    /*
     * 表格行是否可选择功能的配置
     */
    const rowSelection = {
      selectedRowKeys, // 指定选中项的 key 数组，需要和 onChange 进行配合
      onChange: this.handleRowSelectChange, // 选中项发生变化时的回调	Function(selectedRowKeys, selectedRows)
      // 选择框的默认属性配置	Function(record)
      getCheckboxProps: record => ({
        disabled: record.disabled,
      }),
    };

    return (
      <div className={styles.standardTable}>
        <div className={styles.tableAlert}>
          {/* 求和区 */}
          <Alert
            message={
              <Fragment>
                已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                {needTotalList.map(item => (
                  <span style={{ marginLeft: 8 }} key={item.dataIndex}>
                    {item.title}
                    总计&nbsp;
                    <span style={{ fontWeight: 600 }}>
                      {item.render ? item.render(item.total) : item.total}
                    </span>
                  </span>
                ))}
                <a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>
                  清空
                </a>
              </Fragment>
            }
            type="info"
            showIcon
          />
        </div>
        {/* 表格 */}
        <Table
          rowKey={rowKey || 'key'} // 表格行 key 的取值，可以是字符串或一个函数	string|Function(record):string
          rowSelection={rowSelection} // 表格行是否可选择功能的配置
          dataSource={list} // 数据
          pagination={paginationProps} // 分页
          // 分页、排序、筛选变化时触发	Function(pagination, filters, sorter, extra: { currentDataSource: [] })
          onChange={this.handleTableChange}
          {...rest}
        />
      </div>
    );
  }
}

export default StandardTable;
