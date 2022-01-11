const request = (action, params) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'index',
      data: {
        action: action, // 必传
        orgId: 'yunzhi', // 必传
        ...params
      },
      success: (res) => {
        resolve(res);
      },
      fail: (e) => {
        reject(e);
      }
    });
  });
};

const calcActivityAndBtnStatus = (data) => {
  const startTime = data.startTime;
  const endTime = data.endTime;
  const curTime = new Date().getTime();
  const useClock = data.useClock;
  const clocked = !!data.clocked;
  const signed = !!data.signed;

  const beforeTime = 30 * 60 * 1000;

  let state = '';
  let btnName = '';
  let btnCanTap = false;
  let btnType = '';

  if (useClock) {
    if (curTime < startTime - beforeTime) {
      state = 'waiting';
      btnName = signed ? '已报名' : '我要报名';
      btnCanTap = !signed;
      btnType = 'signup';
    } else if (curTime < endTime) {
      state = 'running_clock';
      btnName = clocked ? '已打卡' : '我要打卡';
      btnCanTap = !clocked;
      btnType = 'clock';
    } else {
      state = 'finish_clock';
      btnName = '我要分享';
      btnCanTap = true;
      btnType = 'share';
    }
  } else {
    if (curTime < startTime) {
      state = 'waitting';
      btnName = signed ? '已报名' : '我要报名';
      btnCanTap = !signed;
      btnType = 'signup';
    } else if (curTime < endTime) {
      state = 'running';
      btnName = signed ? '已报名' : '我要报名';
      btnCanTap = !signed;
      btnType = 'signup';
    } else {
      state = 'finish';
      btnName = '我要分享';
      btnCanTap = true;
      btnType = 'share';
    }
  }
  return {
    state,
    btnName,
    btnCanTap,
    btnType
  };
};

module.exports = {
  request,
  calcActivityAndBtnStatus
};
