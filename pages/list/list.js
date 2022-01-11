// pages/list.js
Page({
  background: 'red',
  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    tabs: [
      { name: '最新活动', tab: 'new' },
      { name: '活动热榜', tab: 'top' },
      { name: '积分榜单', tab: 'score' }
    ],
    activeTab: 0,
    curTabName: 'new',
    topTabs: [],
    topActiveTab: 0,
    topCurTabId: '',
    statusBarHeight: 0,
    list: [],
    pageIndex: 1,
    pageSize: 10,
    showLoading: true,
    showEndTip: false,
    showLogin: false,
    buttons: [{ text: '确定' }],
    isRedirectId: '',
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const isLogin = wx.getStorageSync('isLogin');

    this.initHeadSize();
    this.getActivityTypes();
    if (isLogin && options.id) {
      this.goToDetailById(options.id);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const isLogin = wx.getStorageSync('isLogin');
    const forbitReloadList = wx.getStorageSync('forbitReloadList') || '';
    if (forbitReloadList) {
      return wx.setStorageSync('forbitReloadList', false);
    }

    this.getBannerList();
    this.setData(
      {
        isLogin,
        showLogin: false,
        list: [],
        pageIndex: 1
      },
      () => {
        this.fetchActivityList();
      }
    );
  },

  // tab切换
  onTabClick(e) {
    const { item } = e.detail;
    if (!item) return;
    if (this.data.curTabName === item.tab) return;
    this.setData(
      {
        curTabName: item.tab,
        topActiveTab: 0,
        list: [],
        pageIndex: 1,
        topCurTabId: this.data.topTabs[0] && this.data.topTabs[0].tab
      },
      () => {
        this.fetchActivityList();
      }
    );
  },

  fetchActivityList() {
    this.setData(
      {
        showLoading: true,
        showEndTip: false
      },
      () => {
        this.getActivityList(this.data.curTabName === 'new' ? null : this.data.topCurTabId, this.data.pageIndex, this.data.pageSize, this.data.curTabName);
      }
    );
  },

  // 初始化计算头部size
  initHeadSize() {
    const systemInfo = wx.getSystemInfoSync();

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  // 活动热榜下tab切换
  checkTopTabs(e) {
    const item = e.currentTarget.dataset.item;
    const index = e.currentTarget.dataset.index;

    if (!item) return;
    this.setData(
      {
        topActiveTab: index,
        topCurTabId: item.tab,
        list: [],
        pageIndex: 1
      },
      () => {
        this.fetchActivityList();
      }
    );
  },

  getActivityList(activityTypeId, pageIndex, pageSize, type) {
    if (this.data.showLogin) {
      this.setData({
        showEndTip: true
      });
      return false;
    }
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: type === 'score' ? 'getScoreRankList' : 'getActivityList', // 必传
        orgId: 'yunzhi', // 必传
        activityTypeId,
        pageIndex,
        pageSize
      },
      success: (res) => {
        this.setData({
          showLoading: false
        });
        if (this.data.curTabName === type && (!activityTypeId || (activityTypeId && activityTypeId === this.data.topCurTabId))) {
          let data = (res.result && res.result.data) || [];
          if (data.length < this.data.pageSize) {
            this.setData({
              showEndTip: true
            });
          }
          if (type !== 'score') {
            data = data.map((f) => ({ ...f, startTime: f.startTime ? this.dateFormat(new Date(f.startTime)) : '' }));
          }
          this.setData({
            list: this.data.list.concat(data)
          });
        }
      },
      fail: (e) => {
        this.setData({
          showLoading: false
        });
        wx.showToast({
          title: e.result.msg || '网络错误',
          icon: 'error',
          duration: 2000
        });
      }
    });
  },

  getActivityTypes() {
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getAllActivityTypes' // 必传
      },
      success: (res) => {
        const data = res.result.data.map((f) => ({ name: f.activityTypeName, tab: f.activityTypeId }));
        this.setData({
          topTabs: data,
          topCurTabId: data[0] && data[0].tab
        });
      },
      fail: (e) => {
        console.log('createActivity fail', e);
      }
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 到底和loading中 不触发数据更新
    if (this.data.showEndTip || this.data.showLoading) return false;
    this.setData(
      {
        pageIndex: this.data.pageIndex + 1
      },
      () => {
        this.fetchActivityList();
      }
    );
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        wx.cloud.callFunction({
          name: 'index',
          data: {
            action: 'login', // 必传
            orgId: 'yunzhi', // 必传
            ...res.userInfo
          },
          success: (res) => {
            console.log('callFunction result: ', res);
            wx.setStorageSync('isLogin', true);
            wx.setStorageSync('userId', res.result.data.userId);
            wx.setStorageSync('hasPhone', res.result.data.hasPhone);
            wx.setStorageSync('isAdmin', res.result.baseData.isAdmin);
            this.setData(
              {
                showLogin: false,
                isLogin: true
              },
              () => {
                if (this.data.isRedirectId) {
                  this.goToDetailById(this.data.isRedirectId);
                } else {
                  this.fetchActivityList();
                }
              }
            );
          }
        });
      },
      fail: (err) => {
        console.info(err); //  {errMsg: "getUserProfile:fail auth deny"}
      }
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
  // 获取banner列表
  getBannerList() {
    const userId = wx.getStorageSync('userId');
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getBannerList', // 必传
        userId
      },
      success: (res) => {
        this.setData({
          bannerList: res.result.data || []
        });
      },
      fail: (e) => {
        console.log('getBannerList fail', e);
      }
    });
  },
  // 跳转活动详情 - banner
  goToDetail(e) {
    const activityId = e.currentTarget.dataset.activityid;

    if (!this.data.isLogin) {
      return this.setData({
        showLogin: true,
        isRedirectId: activityId
      });
    }
    wx.navigateTo({ url: `/pages/activity/detail/index?id=${activityId}` });
  },
  loginVerity(e) {
    if (!this.data.isLogin) {
      return this.setData({
        showLogin: true,
        isRedirectId: e.detail.activityId
      });
    }
    wx.navigateTo({ url: `/pages/activity/detail/index?id=${e.detail.activityId}` });
  },
  // 跳转活动详情
  goToDetailById(activityId) {
    if (!this.data.isLogin) {
      return this.setData({
        showLogin: true,
        isRedirectId: activityId
      });
    }
    wx.navigateTo({ url: `/pages/activity/detail/index?id=${activityId}` });
  }
});
