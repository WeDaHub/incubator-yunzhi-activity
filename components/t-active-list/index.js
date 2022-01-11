// components/t-active-list/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    hasCup: {
      type: Boolean,
      value: false
    },
    loginVerity: {
      type: Function,
      value: () => {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    goToDetail(e) {
      const activityId = e.currentTarget.dataset.activityid;

      this.triggerEvent('loginverity', { activityId }); // ?撒作用
      // wx.navigateTo({ url: `/pages/activity/detail/index?id=${activityId}` });
    }
  }
});
