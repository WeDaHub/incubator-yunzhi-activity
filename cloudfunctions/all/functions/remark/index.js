const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const { activityId, userId, userName, avatarUrl, score, content } = event;

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

  let curTime = new Date().getTime();
  const startTime = data.startTime;
  const endTime = data.endTime;
  const presenter = data.presenter;
  const activityTypeId = data.activityTypeId;

  const useClock = data.useClock;
  const useSignUp = data.useSignUp;

  if (curTime < endTime) {
    resp.code = 0;
    resp.msg = '活动还未结束';
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
        resp.msg = '查询已评价失败';
      });

    if (resp.msg) return resp;

    const record = res.data[0];

    if (!record) {
      resp.code = 0;
      resp.msg = '无报名打卡记录';
      return resp;
    }

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

  res = await db
    .collection('activity_remark')
    .where({
      activityId,
      userId
    })
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '查询已评价失败';
    });

  if (resp.msg) return resp;

  if (res.data.length > 0) {
    resp.code = 0;
    resp.msg = '您已评价过了';
    return resp;
  }

  curTime = new Date().getTime();

  res = await db.collection('activity_remark').add({
    data: {
      activityId,
      remarkedId: presenter,
      userId,
      score,
      content,
      createTime: curTime,
      updateTime: curTime
    }
  });

  // 添加评价积分
  const catchErr = () => console.error('userId', userId, `添加活动(${activityId})-评价积分失败`);
  const catchLogErr = () => console.error('userId', userId, `添加活动(${activityId})-评价积分明细失败`);

  db.collection('user_score')
    .where({
      activityTypeId,
      userId
    })
    .get()
    .then(async (res) => {
      if (res.errMsg !== 'collection.get:ok') {
        catchErr()
        return;
      }

      const record = res.data[0];

      if (!record) {
        db.collection('user_score')
          .add({
            data: {
              activityTypeId,
              userId,
              count: 10,
              createTime: +new Date()
            }
          })
          .then((res) => {
            db.collection('user_score_log')
              .add({
                data: {
                  userId,
                  activityTypeId,
                  fromType: 'remark',
                  count: 10,
                  createTime: +new Date()
                }
              })
              .catch(catchLogErr);
          }, catchErr);
      } else {
        db.collection('user_score')
          .where({
            activityTypeId,
            userId
          })
          .update({
            data: {
              count: _.inc(10)
            }
          })
          .then((res) => {
            db.collection('user_score_log')
              .add({
                data: {
                  userId,
                  activityTypeId,
                  fromType: 'remark',
                  count: 10,
                  createTime: +new Date()
                }
              })
              .catch(catchLogErr);
          }, catchErr);
      }
    }, catchErr);

  resp.code = 1;
  resp.data = res;
  resp.msg = '评价成功';

  return resp;
};
