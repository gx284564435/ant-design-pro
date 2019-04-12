import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  InputNumber,
  DatePicker,
  Modal,
  message,
  Badge,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import TimePicker from '@/components/TimePicker';
import styles from './TableList.less';

const { RangePicker } = DatePicker;

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['error', 'success'];
const status = ['支出', '收入'];

/**
在（antd Modal)模态对话框内新建表单
（antd Form)Form.create(options)(组件)：包装组件成为表单
 */
const CreateForm = Form.create()(props => {
  // 接收表格传递的参数
  const {
    modalVisible, // 模态框可见性
    form, // Form.create()自动创建form指代当前表单
    modalValues, // 模态框表单值
    handleAdd, // 新增方法
    handleModalVisible, // 模态框可见性处理方法
    modalTitle, //  模态框标题
  } = props;

  const { validateFields, resetFields, getFieldDecorator } = form;

  /*
   * 点击确定回调
   * function(e)
   */
  const okHandle = () => {
    // 校验并获取一组输入域的值与 Error，若 fieldNames 参数为空，则校验全部组件
    // ([fieldNames: string[]],[options: object],callback(errors, values)) => void
    validateFields((err, fieldsValue) => {
      if (err) return;
      // 重置一组输入控件的值（为 initialValue）与状态，如不传入参数，则重置所有组件
      // Function([names: string[]])
      resetFields();
      handleAdd(fieldsValue);
    });
  };

  /*
   * 判断推荐时间是否选择
   */
  const dateSelect = (rule, value, callback) => {
    if (value === undefined) {
      callback(new Error('请输入时间!'));
    } else {
      callback();
    }
  };

  return (
    // （antd)模态对话框
    <Modal
      // 关闭时销毁 Modal 里的子元素
      // 默认关闭后状态不会自动清空, 如果希望每次打开都是新内容，请设置 destroyOnClose。
      destroyOnClose
      title={modalTitle} // 标题
      visible={modalVisible} // 可见性
      onOk={okHandle} // 点击确定回调
      onCancel={() => handleModalVisible()} // 点击遮罩层或右上角叉或取消按钮的回调
    >
      {/*
        标记的子部分内的注释应放在大括号内
        表单域<Form.Item />  const FormItem = Form.Item;
        表单域可以是输入控件，标准表单域，标签，下拉菜单，文本域等
        labelCol：label 标签布局，同 <Col> 组件，设置 span offset 值，如 {span: 3, offset: 12}
        wrapperCol：需要为输入控件设置布局样式时，使用该属性，用法同 labelCol
      */}
      <FormItem>
        {getFieldDecorator('id', {
          initialValue: modalValues.id,
        })(<Input style={{ display: 'none' }} />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户">
        {/*
          this.props.form.getFieldDecorator(id, options)(组件)
          id：必填输入控件唯一标志。支持嵌套式的写法。
          options.rules：校验规则
          https://ant.design/components/form-cn/#this.props.form.getFieldDecorator(id,-options)
          经过 getFieldDecorator 包装的控件，表单控件会自动添加 value（或 valuePropName 指定的其他属性）
            onChange（或 trigger 指定的其他属性），数据同步将被 Form 接管，这会导致以下结果：
          1.你不再需要也不应该用 onChange 来做同步，但还是可以继续监听 onChange 等事件。
          2.你不能用控件的 value defaultValue 等属性来设置表单域的值，默认值可以用 getFieldDecorator 里的 initialValue。
          3.你不应该用 setState，可以使用 this.props.form.setFieldsValue 来动态改变表单值。
        */}
        {getFieldDecorator('user', {
          rules: [{ required: true }],
          initialValue: modalValues.user,
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="分类">
        {getFieldDecorator('classify', {
          rules: [{ required: true, message: '请输入至少两个字符的分类描述！', min: 2 }],
          initialValue: modalValues.classify,
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="商户">
        {getFieldDecorator('business', {
          rules: [{ required: true, message: '请输入至少两个字符的商户描述！', min: 2 }],
          initialValue: modalValues.business,
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="金额">
        {getFieldDecorator('money', {
          rules: [{ required: true, message: '请输入金额！' }],
          initialValue: modalValues.money,
        })(
          <InputNumber
            /* 数字输入框 */
            // 格式化展示 */
            formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            // 指定从 formatter 里转换回数字的方式
            parser={value => value.replace(/¥\s?|(,*)/g, '')}
          />
        )}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="时间">
        {getFieldDecorator('time', {
          rules: [{ required: true, validator: dateSelect.bind(this) }],
          initialValue: modalValues.time,
        })(<TimePicker />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
        {getFieldDecorator('comment', {
          initialValue: modalValues.comment,
        })(<Input placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
});

/* eslint react/no-multi-comp:0 */
@connect(({ expense, loading }) => ({
  expense,
  loading: loading.models.expense,
}))
/**
 *  表格
 */
@Form.create()
class TableList extends PureComponent {
  /*
   * 表格的初始状态
   * 包括表格的状态及新增/修改模态框的状态
   */
  state = {
    modalVisible: false, // 模态框可见性
    expandForm: false, // 是否展开查询表单
    selectedRows: [], // 表格已选的行
    modalValues: {}, // 模态框表单值
    modalTitle: '', // 模态框标题
    formValues: {}, // 查询表单值
  };

  /*
   * 表格的列
   */
  columns = [
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: '用户',
      dataIndex: 'user',
    },
    {
      title: '分类',
      dataIndex: 'classify',
    },
    {
      title: '商户',
      dataIndex: 'business',
    },
    {
      title: '状态',
      key: 'status',
      /* 筛选 */
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
      ],
      render: (text, record) => {
        let val;
        if (record.money.startsWith('+')) {
          val = '1';
        } else {
          val = '0';
        }
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '金额',
      dataIndex: 'money',
    },
    {
      title: '时间',
      dataIndex: 'time',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      render: (text, record) => (
        <a onClick={() => this.handleModalVisible(true, record, '编辑账单')}>修正</a>
      ),
    },
    {
      title: '备注',
      dataIndex: 'comment',
    },
  ];

  /*
   * 在第一次渲染后调用,只在客户端
   */
  componentDidMount() {
    // React Redux的connect进行封装的时候，connect方法会把dispatch放到props中
    const { dispatch } = this.props;
    // 无参调用
    dispatch({
      type: 'expense/fetch',
    });
  }

  /*
   * antd表格分页、排序、筛选变化时触发查询
   * Function(pagination, filters, sorter, extra: { currentDataSource: [] })
   */
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }
    const replacedParams = this.replaceMoment(params);
    dispatch({
      type: 'expense/fetch',
      payload: replacedParams,
    });
  };

  /*
   * 执行表格重置查询
   */
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields(); // 清除表单
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'expense/fetch',
      payload: {},
    });
  };

  /*
   * 展开表格查询表单
   */
  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'expense/remove',
          payload: {
            key: selectedRows.map(row => row.key),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  /*
   * 执行表格查询
   */
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
      };

      this.setState({
        formValues: values,
      });

      const params = this.replaceMoment(fieldsValue);
      dispatch({
        type: 'expense/fetch',
        payload: params,
      });
    });
  };

  /*
   *  更改模态对话框可见性
   *  保存要传递给模态框的状态
   */
  handleModalVisible = (flag, record, modalTitle) => {
    this.setState({
      modalVisible: !!flag,
      modalValues: record || {},
      modalTitle,
    });
  };

  /*
   *  替换日期moment为格式化字符串
   */
  replaceMoment = fields => {
    const params = {};
    Object.keys(fields).forEach(key => {
      if (
        fields[key] instanceof Array &&
        fields[key].length === 2 &&
        fields[key][0] instanceof moment &&
        fields[key][1] instanceof moment
      ) {
        params[key] = `${moment(fields[key][0]).format('YYYY-MM-DD')},${moment(
          fields[key][1]
        ).format('YYYY-MM-DD')}`;
      } else if (fields[key] instanceof moment) {
        params[key] = moment(fields[key]).format('YYYY-MM-DD HH:mm:ss');
      } else {
        params[key] = fields[key];
      }
    });
    return params;
  };

  /*
   *  添加
   */
  handleAdd = fields => {
    const params = this.replaceMoment(fields);

    const { dispatch } = this.props;
    // type指定了调用models命名空间为expense中effects下的*add(){}
    // 参数用payload来传递
    dispatch({
      type: 'expense/add',
      payload: params,
    });

    message.success('操作成功');
    this.handleModalVisible();
  };

  /*
   * 展开前的表格查询框
   */
  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('user')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">支出</Option>
                  <Option value="1">收入</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  /*
   * 展开后的表格查询框
   */
  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名称">
              {getFieldDecorator('user')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">支出</Option>
                  <Option value="1">收入</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="日期">{getFieldDecorator('time')(<RangePicker />)}</FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  /*
   * 切换表格查询框展开
   */
  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const {
      expense: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, modalTitle, modalValues } = this.state;

    /*
     * 传递给模态框的方法和属性
     */
    const modalMethods = {
      handleAdd: this.handleAdd, // 新增
      handleModalVisible: this.handleModalVisible, // 模态框可见性
      modalTitle, // 标题
      modalValues, // 表单值
    };

    return (
      <PageHeaderWrapper title="查询表格">
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* 表格查询表单 */}
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            {/* 表格按钮区域 */}
            <div className={styles.tableListOperator}>
              {/* 表格新建按钮 */}
              <Button
                icon="plus"
                type="primary"
                onClick={() => this.handleModalVisible(true, {}, '新建账单')}
              >
                新建
              </Button>
              {/* 表格批量操作按钮 */}
              {selectedRows.length > 0 && (
                <span>
                  <Button>批量操作</Button>
                </span>
              )}
            </div>
            {/* 列表 */}
            <StandardTable
              selectedRows={selectedRows}
              rowKey={record => record.id}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        {/* 新增/修改 模态框 */}
        <CreateForm {...modalMethods} modalVisible={modalVisible} />
      </PageHeaderWrapper>
    );
  }
}

export default TableList;
