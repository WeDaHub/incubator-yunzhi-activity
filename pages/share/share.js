Component({
  data: {},
  methods: {
    onShareAppMessage(res) {
      if (res.from === 'button') {
        console.log(res.target);
      }
      return {
        title: '分享',
        path: '/pages/index/index'
        /* imageUrl: '' //默认使用截图 */
      };
    },
    // 仅2.11.3+支持Android
    onShareTimeline() {
      return {
        title: '分享朋友圈',
        query: 'a=1&b=2',
        imageUrl: '/assets/images/share-moments.png' //默认使用小程序Logo
      };
    }
  }
});
