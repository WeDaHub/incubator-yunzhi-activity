const app = getApp()

Component({
  data: {},
  methods: {
    goComponent(e) {
      let url = e.currentTarget.dataset.url
      wx.navigateTo({ url })
    },
    getUserProfile() {
      wx.getUserProfile({
        desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.info(JSON.stringify(res.userInfo))

          wx.cloud.callFunction({
            name: 'index',
            data: {
              action: 'login', // 必传
              orgId: 'yunzhi', // 必传
              ...res.userInfo
            },
            success: (res) => {
              console.log('callFunction result: ', res)
              wx.setStorageSync('isLogin', true)
              wx.setStorageSync('userId', res.result.data.userId)
              wx.setStorageSync('hasPhone', res.result.data.hasPhone)
            }
          })
        },
        fail: (err) => {
          console.info(err) //  {errMsg: "getUserProfile:fail auth deny"}
        }
      })
    },
    getPhoneNumber(res) {
      // v1.0.0 可以不用
      wx.cloud.callFunction({
        name: 'index',
        data: {
          action: 'bindPhone', // 必传
          orgId: 'yunzhi', // 必传
          cloudId: res.detail.cloudID
        },
        success: (res) => {
          console.log('callFunction result: ', res)
          wx.setStorageSync('hasPhone', res.result.data.hasPhone)
        }
      })
    },
    openActivity() {
      const url = '/pages/activity/detail/index?id=yunzhi-1621941464875-31'
      wx.navigateTo({ url })
    },
    goMessage() {
      wx.requestSubscribeMessage({
        tmplIds: [''], // TODO: 消息模板ID
        success(res) {
          wx.cloud.callFunction({
            name: 'index',
            data: {
              action: 'subscribeMessage', // 必传
              orgId: 'yunzhi', // 必传
              activityId: 'yunzhi-1621865084003-672'
            },
            success: (res) => {
              console.log('callFunction result: ', res)
            }
          })
        }
      })
    }
  }
})
