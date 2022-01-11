// pages/activity/create/index.js
const dateTimePicker = require('./dateTimePicker.js');

function getGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

Page({
  data: {
    error: '',
    formData: {},
    rules: [
      {
        name: 'name',
        rules: { required: true, message: '活动名称是必填项' }
      },
      {
        name: 'introImgUrl',
        rules: { required: true, message: '请上传活动封面图' }
      },
      {
        name: 'typeId',
        rules: { required: true, message: '请选择活动类型' }
      },
      {
        name: 'presenter',
        rules: { required: true, message: '请输入主持人名称' }
      },
      {
        name: 'startTime',
        rules: { required: true, message: '请选择开始时间' }
      },
      {
        name: 'endTime',
        rules: { required: true, message: '请选择结束时间' }
      },
      {
        name: 'address',
        rules: { required: true, message: '请输入地点' }
      },
      {
        name: 'content',
        rules: { required: true, message: '请输入活动详情' }
      }
    ],
    name: '',
    typeId: '',
    typeName: '',
    creator: '',
    presenter: '',
    startTime: '',
    endTime: '',
    address: '',
    useSignUp: true,
    useClock: false,
    command: '',
    content: '',
    introImgUrl: '',

    activityTypes: [],
    startTimeArray: null,
    endTimeArray: null,

    files: [],

    nameTimeKey: -1,
    contentTimeKey: -1,
    isNeedUpload: false,
    isEdit: false,
    isStage: 1,
    activityId: ''
  },
  onLoad(options) {
    this.getAllActivityTypes();
    if (options.id) {
      this.setData({
        activityId: options.id
      });
      wx.setNavigationBarTitle({
        title: '编辑活动'
      });
      return this.getActivityDetail(options.id);
    }
    const curDate = new Date();
    const nextDate = new Date();
    nextDate.setTime(curDate.getTime() + 86400000);
    const curFullYear = curDate.getFullYear();
    const startObj = dateTimePicker.dateTimePicker(curFullYear, curFullYear + 1, curDate);
    const endObj = dateTimePicker.dateTimePicker(curFullYear, curFullYear + 1, nextDate);

    // startObj.dateTimeArray.pop();
    // endObj.dateTimeArray.pop();
    this.setData({
      selectFile: this.selectFile.bind(this),
      uploadFile: this.uploadFile.bind(this),

      startTime: startObj.dateTime,
      ['formData.startTime']: startObj.date,
      startTimeArray: startObj.dateTimeArray,
      endTime: endObj.dateTime,
      ['formData.endTime']: endObj.date,
      endTimeArray: endObj.dateTimeArray
    });
  },
  getActivityDetail(activityId) {
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getActivityDetailByAdmin', // 必传
        activityId
      },
      success: (res) => {
        console.log('res. ... ', res);
        const data = res.result.data || {};
        const curDate = new Date(data.startTime);
        const nextDate = new Date(data.endTime);
        const curFullYear = curDate.getFullYear();
        const startObj = dateTimePicker.dateTimePicker(curFullYear, curFullYear + 1, curDate);
        const endObj = dateTimePicker.dateTimePicker(curFullYear, curFullYear + 1, nextDate);
        const now = Date.now();
        this.setData({
          selectFile: this.selectFile.bind(this),
          uploadFile: this.uploadFile.bind(this),

          startTime: startObj.dateTime,
          ['formData.startTime']: startObj.date,
          startTimeArray: startObj.dateTimeArray,
          endTime: endObj.dateTime,
          ['formData.endTime']: endObj.date,
          endTimeArray: endObj.dateTimeArray,
          name: data.name,
          ['formData.name']: data.name,
          files: [{ url: data.introImgUrl }],
          introImgUrl: data.introImgUrl,
          ['formData.introImgUrl']: data.introImgUrl,
          useClock: data.useClock,
          ['formData.useClock']: data.useClock,
          address: data.address,
          ['formData.address']: data.address,
          command: data.command,
          ['formData.command']: data.command,
          content: data.content,
          ['formData.content']: data.content,
          presenter: data.presenter,
          ['formData.presenter']: data.presenter,
          typeId: data.activityTypeId,
          ['formData.typeId']: data.activityTypeId,
          isNeedUpload: true,
          isEdit: true,
          isStage: data.startTime > now ? 1 : 2
        });
      },
      fail: (e) => {
        console.log('getActivityDetail fail', e);
      }
    });
  },
  getAllActivityTypes() {
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getAllActivityTypes', // 必传
        orgId: 'yunzhi' // 必传
      },
      success: (res) => {
        const { result } = res;

        console.log('getAllActivityTypes', res);

        if (!result.code) return;

        const types = (result.data || []).map((type) => {
          return {
            id: type.activityTypeId,
            name: type.activityTypeName
          };
        });

        this.setData({
          activityTypes: types
        });
      }
    });
  },
  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
      }
    });
  },
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    });
  },
  selectFile(files) {
    console.log('files', files);
    // 返回false可以阻止某次文件上传
  },
  uploadFile(files) {
    console.log('upload files', files);
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      resolve({
        urls: files.tempFilePaths
      });
    });
  },
  uploadError(e) {
    console.log('upload error', e.detail);
  },
  uploadSuccess(e) {
    const { urls } = e.detail;
    if (!urls) return;

    this.setData({
      files: urls.map((url) => ({ url })),
      introImgUrl: urls[0],
      ['formData.introImgUrl']: urls[0],
      isNeedUpload: false
    });
  },
  changeStartTime(e) {
    this.setData({ startTime: e.detail.value });
  },
  changeEndTime(e) {
    this.setData({ endTime: e.detail.value });
  },
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors);
      if (!valid) {
        const firstError = Object.keys(errors);
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          });
        }
      } else {
        this.createActivity();
      }
    });
  },
  async createActivity() {
    const params = {
      activityTypeId: this.data.typeId,
      command: this.data.command,
      content: this.data.content,
      name: this.data.name,
      presenter: this.data.presenter,
      useClock: this.data.useClock,
      useSignUp: this.data.useSignUp,
      startTime: this.data.formData.startTime.getTime(),
      endTime: this.data.formData.endTime.getTime(),
      address: this.data.address
    };
    const { isEdit, isStage } = this.data;
    if (!isEdit || (isEdit && isStage === 1)) {
      const now = Date.now();
      console.log(params.startTime, now);
      if (params.startTime <= now) {
        wx.hideLoading();
        return this.setData({
          error: '开始时间不能小于当前时间'
        });
      } else if (params.endTime <= params.startTime) {
        wx.hideLoading();
        return this.setData({
          error: '结束时间不能小于开始时间'
        });
      }
    }
    wx.showLoading();
    const fileID = this.data.isNeedUpload ? this.data.introImgUrl : await this.uploadActivityImg(this.data.introImgUrl);
    if (!fileID) {
      wx.hideLoading();
      return;
    }

    this.data.introImgUrl = fileID;
    Object.assign(params, {
      introImgUrl: fileID
    });
    this.setData({
      isNeedUpload: true
    });
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'createActivity', // 必传
        orgId: 'yunzhi', // 必传
        ...params,
        activityId: isEdit ? this.data.activityId : ''
      },
      success: (res) => {
        const { result } = res;
        console.log('createActivity', res);

        if (!result.code) return;

        wx.showToast({
          title: isEdit ? '更新成功' : '创建成功'
        });

        wx.redirectTo({ url: `/pages/activity/detail/index?id=${res.result.data.id}` });
      },
      fail: (e) => {
        console.log('createActivity fail', e);
        wx.hideLoading();
      }
    });
  },

  uploadActivityImg(url) {
    return new Promise((resolve, reject) => {
      const date = new Date();
      const filePath = url;
      const extName = filePath.substring(filePath.lastIndexOf('.'));
      wx.cloud
        .uploadFile({
          cloudPath: `${this.data.typeId}/${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}/${getGuid()}${extName}`, // {userid}/{date}/
          filePath
        })
        .then(
          (res) => {
            console.log('upload succ', res);
            resolve(res.fileID);
          },
          (e) => {
            reject(e);
          }
        );
    });
  },

  handleInputName(e) {
    const inputName = e.detail.value || '';

    if (this.nameTimeKey >= 0) {
      clearTimeout(this.nameTimeKey);
    }
    this.nameTimeKey = setTimeout(() => {
      this.setData({
        name: inputName,
        ['formData.name']: inputName
      });
    }, 100);
  },
  handleInputContent(e) {
    const inputContent = e.detail.value || '';

    if (this.contentTimeKey >= 0) {
      clearTimeout(this.contentTimeKey);
    }
    this.contentTimeKey = setTimeout(() => {
      this.setData({
        content: inputContent,
        ['formData.content']: inputContent
      });
    }, 100);
  },
  handleTypeTap(e) {
    const { item } = e.currentTarget.dataset;

    if (!item) return;

    this.setData({
      typeId: item.id,
      typeName: item.name,
      ['formData.typeId']: item.id
    });
  },
  formInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
      [`formData.${field}`]: e.detail.value
    });
  },
  handleSwitchChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [field]: e.detail.value,
      [`formData.${field}`]: e.detail.value
    });
  },
  changeStartTime(e) {
    const timeArray = this.data.startTimeArray;
    const time = e.detail.value;

    const year = timeArray[0][time[0]];
    const month = timeArray[1][time[1]];
    const day = timeArray[2][time[2]];
    const h = timeArray[3][time[3]];
    const m = timeArray[4][time[4]];
    const s = timeArray[5][time[5]];

    const date = this.data.formData.startTime || new Date();
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(0);

    this.setData({
      ['formData.startTime']: date,
      startTime: time
    });
  },
  changeEndTime(e) {
    const timeArray = this.data.endTimeArray;
    const time = e.detail.value;

    const year = timeArray[0][time[0]];
    const month = timeArray[1][time[1]];
    const day = timeArray[2][time[2]];
    const h = timeArray[3][time[3]];
    const m = timeArray[4][time[4]];
    const s = timeArray[5][time[5]];

    const date = this.data.formData.endTime || new Date();
    date.setFullYear(year);
    date.setMonth(month - 1);
    date.setDate(day);
    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(s);
    date.setMilliseconds(0);

    this.setData({
      ['formData.endTime']: date,
      endTime: time
    });
  }
});
