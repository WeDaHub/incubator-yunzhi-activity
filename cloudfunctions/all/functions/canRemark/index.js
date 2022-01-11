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

  if (!data.useClock) {
    resp.code = 0;
    resp.msg = '活动未开启打卡';
    return resp;
  }

  const curTime = new Date().getTime();
  const startTime = data.startTime;
  const endTime = data.endTime;

  const useClock = data.useClock;
  const useSignUp = data.useSignUp;

  let can = false;

  if (curTime < endTime) {
    resp.code = 1;
    resp.data = {
      can
    };
    resp.msg = '活动未结束';
    return resp;
  }

  if (useClock || useSignUp) {
    res = await db
      .collection('activity_sign')
      .where({
        activityId,
        userId
      })
      .get()
      .catch(() => {
        resp.code = 0;
        resp.msg = '查询活动是否已评价失败';
      });

    if (resp.msg) return resp;

    const record = res.data[0];

    if (useClock) {
      if (!record.clocked) {
        resp.code = 0;
        resp.msg = '您未打卡';
        return;
      }
    } else if (useSignUp) {
      if (!record.signed) {
        resp.code = 0;
        resp.msg = '您未报名';
        return;
      }
    }
  }

  can = true;

  resp.code = 1;
  resp.data = {
    can
  };
  resp.msg = '查询成功';

  return resp;
};
