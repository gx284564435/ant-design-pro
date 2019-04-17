import React, { PureComponent } from 'react';
import { Upload, Icon, Modal, message } from 'antd';

class PreviewOriginSize extends PureComponent {
  // 设置props默认值
  static defaultProps = {
    numberOfLimit: 1, // 最多允许上传多少张图片 默认为1张
    numberOfSize: 2, // 默认上传大小限制2MB
    onRemove: () => {
      // 删除成功回调
    },
    onChange: () => {}, // 值改变时的回调
  };

  constructor(props) {
    super(props);
    this.state = {
      fileList: [], // 已上传图片
      previewVisible: false, // 是否预览图片标识
      previewImageUrl: '', // 预览图片的URL
      previewImageName: '', // 预览图片的名称
    };
  }

  // 图片预览事件
  handlePreview = file => {
    this.setState({
      previewImageUrl: file.url || file.thumbUrl,
      previewImageName: file.name,
      previewVisible: true,
    });
  };

  // 取消图片预览事件
  handlePreviewCancel = () => {
    this.setState({
      previewVisible: false,
    });
  };

  // 文件上传改变事件
  handleChange = e => {
    let { fileList } = e;
    const { file } = e;
    const fileStatus = file.status;

    if (fileStatus === 'uploading') {
      // 上传中
      //  console.log('uploading....');
    } else if (fileStatus === 'done') {
      // 上传成功
      const { response } = file;
      if (!response) {
        message.error('抱歉，文件由于未知原因上传失败!');
        return;
      }
      // 上传成功(success为true并且响应码为200)
      //  if (responseMeta && responseMeta.success && responseMeta.statusCode === 200) {
      if (response === 'ok') {
        this.getUploadedImage(fileList);
      } else {
        message.error('抱歉，文件由于未知原因上传失败!');
        // 过滤上传失败的图片
        fileList = this.filterUploadFailFile(fileList, file);
      }
    } else if (fileStatus === 'error') {
      // 上传出错
      message.error('抱歉，文件由于未知原因上传失败!');
      // 过滤上传失败的图片
      fileList = this.filterUploadFailFile(fileList, file);
    }
    if (fileStatus) {
      this.setState({
        fileList,
      });
    }
  };

  // 过滤上传失败的图片
  filterUploadFailFile = (list, failUploadedFile) =>
    list.filter(file => file.uid !== failUploadedFile.uid);

  // 获取上传成功的图片
  getUploadedImage = fileList => {
    const { onChange } = this.props;
    this.setState(fileList);
    // 父组件回调方法，在父组件可以拿到已经上传成功的图片信息
    if (onChange && typeof onChange === 'function') {
      onChange(fileList);
    }
  };

  // 上传文件之前的钩子，参数为准备上传的文件，若返回 false 则停止上传
  // 一般在beforeUpload方法内限制文件上传的格式以及大小
  handelBeforeUpload = file => {
    const fileType = file.type;
    const fileName = file.name;
    // 判断是否支持该文件格式
    const isInvalidFileType = !fileType || fileType.length < 1;
    if (isInvalidFileType) {
      message.error('抱歉，不支持上传该格式的文件！');
      return !isInvalidFileType;
    }

    const availFileSuffix = ['.png', '.PNG', '.jpg', '.JPG', '.bpm', '.BPM', '.gif', '.GIF'];
    const fileSuffixName = fileName.substring(file.name.lastIndexOf('.'));
    const isAvailableSuffix = availFileSuffix.includes(fileSuffixName);
    if (!isAvailableSuffix) {
      const msg = `抱歉，只支持上传【 ${availFileSuffix.join(' || ')} 】格式的文件！`;
      message.error(msg);
      return isAvailableSuffix;
    }

    // 限制上传文件大小(默认上传大小限制2MB)
    const { numberOfSize } = this.props;
    const availSize = numberOfSize || 2;
    if (availSize === -1) {
      // -1 不限制
      return true;
    }
    const fileSize = file.size / 1024 / 1024;
    const isOverSize = fileSize > availSize;

    if (isOverSize) {
      const msg = `抱歉，上传文件大小最大不能超过 ${availSize} M！`;
      message.error(msg);
      return !isOverSize;
    }
    return true;
  };

  // 删除图片事件
  handleRemove = file => {
    const { fileList } = this.state;
    for (let index = 0, len = fileList.length; index < len; index++) {
      if (fileList[index].uid === file.uid) {
        fileList.splice(index, 1);
        break;
      }
    }
    this.setState({
      fileList,
    });
  };

  render() {
    const { previewVisible, previewImageUrl, fileList, previewImageName } = this.state;
    const { numberOfLimit } = this.props || 1; // 默认最多上传一张图片
    const { action, data } = this.props; //

    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">Upload</div>
      </div>
    );

    // 根据saveType构造上传的url
    // 请求发送的数据

    const params = {
      name: 'file',
      action, // 图片上传路径
      accept: 'image/*', // 接受上传的文件类型,指定为image/**的话，弹出选择文件窗口的时候只会显示图片类型文件，过滤掉.txt、.xsl等非图片文件
      listType: 'picture-card', // 图片墙样式
      multiple: false, // 是否允许多选
      fileList, // 已上传的图片
      data, // 上传所需参数
      beforeUpload: this.handelBeforeUpload, // 图片上传前执行的方法
      onPreview: this.handlePreview, // 预览图片执行的方法
      onChange: this.handleChange, // 值改变执行的方法
    };

    return (
      <div className="clearfix">
        <Upload {...params}>{fileList.length >= numberOfLimit ? null : uploadButton}</Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handlePreviewCancel}>
          <img alt={previewImageName} style={{ width: '100%' }} src={previewImageUrl} />
        </Modal>
      </div>
    );
  }
}

export default PreviewOriginSize;
