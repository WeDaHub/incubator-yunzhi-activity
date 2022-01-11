const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const { activityId, command, userId, userName, avatarUrl } = event;

  let res = await db
    .collection('activity')
    .where({
      activityId
    })
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取活动详情失败';
    });

  if (resp.msg) return resp;

  if (!res.data || res.data.length <= 0) {
    resp.code = 0;
    resp.msg = '活动不存在';
    return resp;
  }

  const data = res.data[0];

  if (!data.useSignUp) {
    resp.code = 0;
    resp.msg = '活动未开启报名';
    return resp;
  }

  const curTime = new Date().getTime();
  const startTime = data.startTime;
  const endTime = data.endTime;
  const useClock = data.useClock;

  const beforeTime = 30 * 60 * 1000;

  let can = false;

  if (curTime >= endTime) {
    resp.code = 1;
    resp.data = {
      can
    };
    resp.msg = '活动已结束';
    return resp;
  }
  if (useClock) {
    if (curTime >= startTime - beforeTime) {
      resp.code = 1;
      resp.data = {
        can
      };
      resp.msg = '活动已开始打卡';
      return resp;
    }
  } else if (curTime >= startTime) {
    resp.code = 1;
    resp.data = {
      can
    };
    resp.msg = '活动已开始';
    return resp;
  }

  res = await db
    .collection('activity_sign')
    .where({
      activityId,
      userId
    })
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '查询是否已报名失败';
    });

  if (resp.msg) return resp;

  can = res.data.length <= 0;

  resp.code = 1;
  resp.data = {
    can
  };
  resp.msg = '查询成功';

  return resp;
};
