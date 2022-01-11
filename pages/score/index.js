// pages/score/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    list: [],
    isLogin: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initHeadSize();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getScoreInfo();
    const isLogin = wx.getStorageSync('isLogin');
    this.setData({
      isLogin
    });
  },

  initHeadSize() {
    const systemInfo = wx.getSystemInfoSync();

    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },
  getScoreInfo() {
    const userId = wx.getStorageSync('userId');
    // if (!userId) return;
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getScoreInfo', // 必传
        userId
      },
      success: (res) => {
        console.log(res.result);
        this.setData({
          list: res.result.data || []
        });
      },
      fail: (e) => {
        console.log('createActivity fail', e);
      }
    });
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
            wx.setStorageSync('userId', res.result.data.userId);
            wx.setStorageSync('isLogin', true);
            wx.setStorageSync('hasPhone', res.result.data.hasPhone);
            wx.setStorageSync('isAdmin', res.result.baseData.isAdmin);
            this.setData({
              showLogin: false,
              isLogin: true
            });
            this.getScoreInfo();
          }
        });
      },
      fail: (err) => {
        console.info(err); //  {errMsg: "getUserProfile:fail auth deny"}
      }
    });
  }
});
