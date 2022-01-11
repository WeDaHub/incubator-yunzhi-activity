// pages/personal/myCreateActive/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    list: [],
    pageIndex: 1,
    pageSize: 10,
    showLoading: true,
    showEndTip: false,
    buttons: [{ text: '编辑', type: 'warn' }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const uid = wx.getStorageSync('userId');
    this.setData(
      {
        userId: uid
      },
      () => {
        this.getMyActivityList();
      }
    );
  },

  getMyActivityList() {
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: 'getMyCreateActivity', // 必传
        userId: this.data.userId,
        pageIndex: this.data.pageIndex,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        const data = (res.result && res.result.data) || [];

        this.setData({
          list: this.data.list.concat(data.map((f) => ({ ...f, startTime: f.startTime ? this.dateFormat(new Date(f.startTime)) : '' }))),
          showLoading: false,
          showEndTip: data.length < this.data.pageSize
        });
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('1 onReachBottom');
    // 到底和loading中 不触发数据更新
    if (this.data.showEndTip || this.data.showLoading) return false;
    this.setData(
      {
        pageIndex: this.data.pageIndex + 1
      },
      () => {
        this.getMyActivityList();
      }
    );
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
  slideButtonTap(e) {
    const { index } = e.detail;
    const activityId = e.currentTarget.dataset.activityid;

    // 编辑
    if (index === 0) {
      wx.navigateTo({ url: `/pages/activity/create/index?id=${activityId}` });
    }
  },
  handleItemTap(e) {
    const activityId = e.currentTarget.dataset.activityid;

    wx.navigateTo({ url: `/pages/activity/detail/index?id=${activityId}` });
  }
});
