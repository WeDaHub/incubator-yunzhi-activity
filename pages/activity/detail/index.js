// pages/activity/detail/index.js
const logic = require('./logic');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loadingData: false,

    indicatorDots: false,
    autoplay: false,
    interval: 2000,
    duration: 500,

    imgs: [],

    name: '',
    presenter: '',
    dateRange: '',
    address: '',
    content: ``,

    allTabs: [
      {
        type: 'detail',
        name: '活动详情',
        tab: 'detail'
      },
      {
        type: 'sign',
        name: '报名人员',
        tab: 'user'
      },
      {
        type: 'clock',
        name: '打卡人员',
        tab: 'user'
      },
      {
        type: 'join',
        name: '参与人员',
        tab: 'user'
      },
      {
        type: 'comment',
        name: '评价',
        tab: 'comment'
      }
    ],
    statusIncludeTabs: {
      waiting: [0, 1],
      running: [0, 1],
      running_clock: [0, 1, 2],
      finish: [0, 1, 4],
      finish_clock: [0, 1, 3, 4]
    },

    tabs: [],
    activeTab: 0,
    curTabName: 'detail',

    comments: [],

    users: [],

    userLoading: false,
    commentLoading: false,

    dialogClockShow: false,
    dialogCommentShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],

    commentStar: 0,
    commentContent: '',

    btnName: '',
    btnCanTap: false,
    btnType: '',

    canRemark: false,

    isOwner: false,

    activityState: '',

    activityData: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const activityId = options.id;

    if (!activityId) {
      wx.showToast({
        title: '查看活动失败'
      });
      return;
    }

    this.getActivityDetail(activityId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('onReachBottom');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const data = this.data.activityData;
    return {
      title: data.name,
      path: '/pages/list/list?id=' + data.activityId
    };
  },

  // ======================== 逻辑处理 =======================

  async getActivityDetail(activityId) {
    wx.showLoading({ title: '加载中...' });

    const params = {
      activityId
    };

    const res = await logic.request('getActivity', params);

    wx.hideLoading();

    const { result } = res;
    console.log('getActivity', res);

    if (!result.code) return;

    const { data } = result;
    if (!data) return;

    const { signedNum, remarkNum, clockedNum, record } = data;

    const { startTime, endTime } = record;

    const { state, btnName, btnCanTap, btnType } = logic.calcActivityAndBtnStatus(record);

    const includeTabs = this.data.statusIncludeTabs[state];
    let tabs = [];
    if (includeTabs) {
      tabs = includeTabs.map((idx) => {
        return this.data.allTabs[idx];
      });
    }

    let tab = tabs.find((o) => o.type === 'sign');
    if (tab) {
      tab.num = signedNum;
    }

    tab = tabs.find((o) => o.type === 'clock');
    if (tab) {
      tab.num = clockedNum;
    }

    tab = tabs.find((o) => o.type === 'join');
    if (tab) {
      tab.num = clockedNum;
    }

    tab = tabs.find((o) => o.type === 'comment');
    if (tab) {
      tab.num = remarkNum;
    }

    this.setData({
      activityData: record,

      btnName,
      btnCanTap,
      btnType,
      tabs,
      activityState: state,
      address: record.address,
      presenter: record.presenter,
      content: record.content,
      name: record.name,
      imgs: [record.introImgUrl],
      dateRange: `${this.dateFormat(new Date(startTime))} 至 ${this.dateFormat(new Date(endTime))}`
    });
  },

  dateFormat(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();

    const t = (i) => (i < 10 ? '0' + i : '' + i);

    return `${year}-${t(month)}-${t(day)} ${t(h)}:${t(m)}:${t(s)}`;
  },

  gotoClockin() {
    const data = this.data.activityData;
    if (data.command) {
      this.setData({
        dialogClockShow: true
      });
    } else {
      this.clockin(data.activityId, '');
    }
  },

  async getSignUpList(activityId) {
    // wx.showLoading()
    this.setData({
      users: [],
      userLoading: true
    });

    const params = {
      activityId
    };

    const res = await logic.request('getActivitySignUp', params);

    // wx.hideLoading()
    this.setData({
      userLoading: false
    });

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    const arr = (result.data || []).map((record) => ({
      userid: record.userId,
      headimgurl: record.avatarUrl,
      name: record.userName,
      date: this.dateFormat(new Date(record.signTime))
    }));
    const tab = this.data.tabs.find((o) => o.type === 'sign');
    tab.num = arr.length;

    this.setData({
      users: arr,
      tabs: this.data.tabs
    });
  },

  async getClockList(activityId) {
    // wx.showLoading()
    this.setData({
      users: [],
      userLoading: true
    });

    const params = {
      activityId
    };

    const res = await logic.request('getActivityClock', params);

    // wx.hideLoading()
    this.setData({
      userLoading: false
    });

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    const arr = (result.data || []).map((record) => ({
      userid: record.userId,
      headimgurl: record.avatarUrl,
      name: record.userName,
      date: this.dateFormat(new Date(record.clockTime))
    }));

    const tab = this.data.tabs.find((o) => o.type === 'clock');
    if (tab) {
      tab.num = arr.length;
    }

    this.setData({
      users: arr,
      tabs: this.data.tabs
    });
  },
  async getJoinList(activityId) {
    this.getClockList(activityId);
  },
  async getCommentList(activityId) {
    // wx.showLoading()
    this.setData({
      comments: [],
      userLoading: true
    });

    const params = {
      activityId
    };

    const res = await logic.request('getActivityRemarks', params);

    // wx.hideLoading()
    this.setData({
      userLoading: false
    });

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    const { list, canRemark } = result.data;

    const arr = (list || []).map((record) => ({
      id: record._id,
      headimgurl: record.avatarUrl,
      name: record.userName,
      date: this.dateFormat(new Date(record.createTime)),
      star: record.score,
      content: record.content
    }));

    const tab = this.data.tabs.find((o) => o.type === 'comment');
    tab.num = arr.length;

    this.setData({
      comments: arr,
      canRemark,
      tabs: this.data.tabs
    });
  },

  async signup(activityId) {
    wx.showLoading({ title: '提交中...', mask: true });

    const params = {
      activityId
    };

    const res = await logic.request('signup', params);

    wx.hideLoading();

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    wx.showToast({
      title: '报名成功'
    });

    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'subscribeMessage', // 必传
        orgId: 'yunzhi', // 必传
        activityId
      }
    });

    this.setData({
      btnName: '已报名',
      btnCanTap: false
    });

    this.getSignUpList(activityId);
  },

  async clockin(activityId, command) {
    wx.showLoading({ title: '提交中...', mask: true });

    const params = {
      activityId,
      command
    };

    const res = await logic.request('clockin', params);

    wx.hideLoading();

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    wx.showToast({
      title: '打卡成功'
    });

    this.setData({
      btnName: '已打卡',
      btnCanTap: false,
      dialogClockShow: false,
      command: ''
    });

    this.getClockList(activityId);
  },

  async remark(activityId, content, score) {
    wx.showLoading({ title: '提交中...', mask: true });

    const params = {
      activityId,
      content,
      score
    };
    const res = await logic.request('remark', params);

    wx.hideLoading();

    const { result } = res;

    if (!result.code) {
      wx.showToast({
        icon: 'error',
        title: result.msg
      });
      return;
    }

    wx.showToast({
      title: '评价成功'
    });
    this.setData({
      dialogCommentShow: false
    });

    this.getCommentList(activityId);
  },

  shareActivity() {
    wx.showToast({
      title: '分享成功'
    });
  },

  // ====================== wxml 事件handle ========================

  handleNavigateBack(e) {
    try {
      wx.setStorageSync('forbitReloadList', true);
    } catch (e) {}

    wx.navigateBack({
      delta: 1
    });
  },

  handleTabSelect(e) {
    console.log('handleTabSelect', e);
    const { item } = e.detail;
    if (!item) return;

    const { activityId } = this.data.activityData;

    switch (item.type) {
      case 'detail':
        break;
      case 'sign':
        this.getSignUpList(activityId);
        break;
      case 'clock':
        this.getClockList(activityId);
        break;
      case 'join':
        this.getJoinList(activityId);
        break;
      case 'comment':
        this.getCommentList(activityId);
        break;
    }

    this.setData({
      curTabName: item.tab
    });
  },

  handleInputComment() {
    this.setData({
      dialogCommentShow: true
    });
  },

  handleTapOptBtn(e) {
    const data = this.data.activityData;
    const self = this;
    const tmplId = ''; // TODO: 消息模板ID

    switch (this.data.btnType) {
      case 'signup':
        wx.requestSubscribeMessage({
          tmplIds: [tmplId],
          success(res) {
            if (res[tmplId] === 'accept') {
              console.log('requestSubscribeMessage succ', res);
              self.signup(data.activityId);
            }
          },
          fail(res) {
            console.log('requestSubscribeMessage fail', res);
          }
        });
        break;
      case 'clock':
        this.gotoClockin(data.activityId);
        break;
      case 'share':
        this.shareActivity();
        break;
    }
  },
  handleInputCommand(e) {
    this.setData({
      command: e.detail.value
    });
  },
  handleInputCommentContent(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  handleTapDialogClockBtn(e) {
    console.log('handleTapDialogClockBtn', e, this.data.command);
    const { index } = e.detail;
    if (index === 0) {
      this.setData({
        dialogClockShow: false
      });
      return;
    }

    // 校验口令
    this.clockin(this.data.activityData.activityId, this.data.command);
  },
  handleTapDialogCommentBtn(e) {
    console.log('handleTapDialogCommentBtn', e);
    const { index } = e.detail;
    if (index === 0) {
      this.setData({
        dialogCommentShow: false
      });
      return;
    }

    // 评价校验
    if (!this.data.commentContent) {
      wx.showToast({
        title: '请填写评价'
      });
      return;
    }
    if (this.data.commentStar <= 0) {
      wx.showToast({
        title: '请点评星级'
      });
      return;
    }

    // 提交评价
    this.remark(this.data.activityData.activityId, this.data.commentContent, this.data.commentStar);
  },
  handleTapCommentStar(e) {
    console.log('handleTapCommentStar', e);
    const { item } = e.target.dataset;
    if (!item) return;

    this.setData({
      commentStar: Number(item)
    });
  }
});
