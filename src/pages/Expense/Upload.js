import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Layout, Form, Input, Icon, Button, Radio, Upload, message } from 'antd';
import { FormattedMessage } from 'umi/locale';
import EditableTable from '@/components/Table/EditableTable';
import styles from './Upload.less';

const { Sider, Content } = Layout;

const FormItem = Form.Item;

/**
 * 上传组件
 */
class PreviewOriginSize extends PureComponent {
  render() {
    const { uploadFileList, action, data, handleUploadChange, loading } = this.props;
    const disabled = loading; // 图片识别是禁止再次上传，防止重复提交
    const onChange = ({ file }) => handleUploadChange(file);
    const params = {
      name: 'file',
      action, // 图片上传路径
      accept: 'image/*', // 接受上传的文件类型,指定为image/**的话，弹出选择文件窗口的时候只会显示图片类型文件
      multiple: false, // 是否允许多选
      data, // 上传所需额外参数
      onChange, // 值改变执行的方法
      disabled,
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
    // ******************************表格 属性 end***************************************************
  };

  /*
   * 表格的列
   */
  columns = [
    {
      title: '用户',
      dataIndex: 'user',
      editable: true, // 自定义属性，列是否可编辑
    },
    {
      title: '分类',
      dataIndex: 'classify',
      editable: true,
    },
    {
      title: '商户',
      dataIndex: 'business',
      editable: true,
    },
    {
      title: '金额',
      dataIndex: 'money',
      inputType: 'number', // 自定义属性，输入框类型，默认文本text
      editable: true,
      width: 50, // 宽度，可伸缩标题必须
    },
    {
      title: '时间',
      dataIndex: 'time',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      inputType: 'date',
      editable: true,
      width: 160,
    },
    {
      title: '备注',
      dataIndex: 'comment',
      editable: true,
      required: false, // 自定义属性，是否必填，默认true
    },
  ];

  // *******************************上传组件 方法 start************************************************
  /**
   * 文件上传改变事件
   * @param file
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
  /**
   * 表单提交
   * @param fields
   */
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

  // ******************************表格组件 方法 start***************************************************

  handleTableSave = fieldValues => {
    const { dispatch } = this.props;
    const params = this.replaceMoment(fieldValues);
    dispatch({
      type: 'upload/addExpense',
      payload: params,
      callback: () => message.success('操作成功'),
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

  /**
   *  禁止选择的日期
   * @param current
   * @returns {*|boolean}
   */
  disabledDate = current =>
    // 不能晚于当天
    current && current > moment().endOf('day');

  /**
   * rowClassName	表格行的类名	Function(record, index):string
   */
  rowClassName = () => styles.aliPay;

  // ******************************表格组件 方法 end***************************************************

  render() {
    const {
      upload: { data },
      loading,
    } = this.props;
    const { uploadFileList, imgMarginTop, imgWidth, formVisible } = this.state;
    return (
      <div>
        <Layout>
          <Sider width={imgWidth} style={{ background: '#ffd' }}>
            {/* 上传组件 */}
            <PreviewOriginSize
              action="/api/expense/upload"
              uploadFileList={uploadFileList}
              handleUploadChange={e => this.handleUploadChange(e)}
              loading={loading}
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
              {/* 可编辑表格 */}
              <EditableTable
                className={styles.headHeight107}
                propColumns={this.columns}
                dataSource={data.list}
                rowKey="id"
                pagination={false}
                // 子组件传递参数，要接收
                handleTableSave={fieldValues => this.handleTableSave(fieldValues)}
                disabledDate={this.disabledDate}
                resizeableTitle // 可伸缩标题
                // 子组件回调参数，不接收
                rowClassName={() => this.rowClassName()}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}

export default UploadExpense;
