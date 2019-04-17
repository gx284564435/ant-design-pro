import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Layout, Form, Input, Icon, Button, Badge, Radio, Upload, message } from 'antd';
import { FormattedMessage } from 'umi/locale';
import NoPagination from '@/components/StandardTable/NoPagination';
import styles from './Upload.less';

const { Sider, Content } = Layout;

const FormItem = Form.Item;

const statusMap = ['error', 'success'];
const status = ['支出', '收入'];

/**
 * 上传组件
 */
class PreviewOriginSize extends PureComponent {
  render() {
    const { uploadFileList, action, data, handleUploadChange } = this.props;

    const onChange = ({ file }) => handleUploadChange(file);
    const params = {
      name: 'file',
      action, // 图片上传路径
      accept: 'image/*', // 接受上传的文件类型,指定为image/**的话，弹出选择文件窗口的时候只会显示图片类型文件
      multiple: false, // 是否允许多选
      data, // 上传所需额外参数
      onChange, // 值改变执行的方法
    };
    return (
      <Upload {...params} fileList={uploadFileList}>
        <Button>
          <Icon type="upload" /> Upload
        </Button>
      </Upload>
    );
  }
}

/**
 * 表单
 */
@Form.create()
class UploadForm extends PureComponent {
  render() {
    const {
      form: { validateFields, getFieldDecorator },
      handleSubmit,
      formVisible,
    } = this.props;

    const onSubmit = e => {
      e.preventDefault();
      validateFields((err, fieldsValue) => {
        if (err) return;
        handleSubmit(fieldsValue);
      });
    };

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 7 },
      },
    };

    return (
      <Form onSubmit={onSubmit} style={{ marginTop: 8, display: formVisible }}>
        <FormItem {...formItemLayout} label="用户">
          {getFieldDecorator('user', {
            rules: [
              {
                required: true,
                message: '请输入用户',
              },
            ],
          })(<Input placeholder="请输入用户" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="支付类型">
          {getFieldDecorator('expenseType', {
            initialValue: 'aliPay',
          })(
            <Radio.Group>
              <Radio value="aliPay">支付宝</Radio>
              <Radio value="weiXin">微信</Radio>
            </Radio.Group>
          )}
        </FormItem>
        <FormItem {...submitFormLayout}>
          <Button type="primary" htmlType="submit">
            <FormattedMessage id="form.submit" />
          </Button>
        </FormItem>
      </Form>
    );
  }
}

/* eslint react/no-multi-comp:0 */
@connect(({ upload, loading }) => ({
  upload,
  loading: loading.models.upload,
}))

/**
 *  最终组件
 */
class UploadExpense extends PureComponent {
  /*
   * 表格的初始状态
   * 包括表格的状态及新增/修改模态框的状态
   */
  state = {
    // *******************************上传组件 属性 start************************************************
    uploadFileList: [], // 已上传图片
    // 上传图片base64展示属性
    imgWidth: '400',
    imgMarginTop: '-118px',
    // ******************************上传组件 属性 end***************************************************
    // *******************************表单 属性 start************************************************
    formVisible: 'none',
    // *******************************表单 属性 end************************************************
    // *******************************表格 属性 start************************************************
    selectedRows: [], // 表格已选的行
    // ******************************表格 属性 end***************************************************
  };

  /*
   * 表格的列
   */
  columns = [
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
      needTotal: true,
    },
    {
      title: '时间',
      dataIndex: 'time',
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

  // *******************************上传组件 方法 start************************************************
  /*
   * 文件上传改变事件
   */
  handleUploadChange = file => {
    // 只能上传一个
    const uploadFileList = [];
    uploadFileList.push(file);
    // 上传后存储上传的图片的base64
    const preview = document.querySelector('#previewOriginSize');
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        preview.src = reader.result;
      },
      false
    );
    if (file) {
      reader.readAsDataURL(file.originFileObj);
    }

    this.setState({ uploadFileList, formVisible: 'block' });
  };
  // ******************************上传组件 方法 end***************************************************

  // *******************************表单组件 方法 start************************************************
  handleSubmit = fields => {
    const { dispatch } = this.props;
    const { uploadFileList } = this.state;
    if (uploadFileList.length === 0) {
      message.error('请先上传账单');
    } else {
      this.setState({ formVisible: 'none' });
      const newValues = fields;
      newValues.fileName = uploadFileList[0].name;
      dispatch({
        type: 'upload/generator',
        payload: newValues,
        callback: () => message.success('操作成功'),
      });
    }
  };
  // ******************************表单组件 方法 end***************************************************

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  /*
   * rowClassName	表格行的类名	Function(record, index):string
   */
  setClassName = () => styles.aliPay;

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

  render() {
    const {
      upload: { data },
      loading,
    } = this.props;
    const { uploadFileList, imgMarginTop, imgWidth, formVisible, selectedRows } = this.state;
    return (
      <div>
        <Layout>
          <Sider width={imgWidth} style={{ background: '#ffd' }}>
            {/* 上传组件 */}
            <PreviewOriginSize
              action="/api/expense/upload"
              uploadFileList={uploadFileList}
              handleUploadChange={e => this.handleUploadChange(e)}
            />
            {/* 表单组件 */}
            <UploadForm
              formVisible={formVisible}
              uploadFileList={uploadFileList}
              handleSubmit={fieldValues => this.handleSubmit(fieldValues)}
            />
            {/* 上传文件base64展示组件 */}
            <div style={{ overflow: 'hidden' }}>
              <img
                id="previewOriginSize"
                src=""
                alt=""
                style={{ marginTop: imgMarginTop }}
                width={imgWidth}
              />
            </div>
          </Sider>
          <Layout>
            <Content>
              {/* 列表 */}
              <NoPagination
                selectedRows={selectedRows}
                rowKey={record => record.id}
                loading={loading}
                data={data}
                columns={this.columns}
                onSelectRow={this.handleSelectRows}
                rowClassName={this.setClassName}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default UploadExpense;
