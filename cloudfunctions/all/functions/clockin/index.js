const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

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
      resp.msg = '获取详情失败';
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
  const activityTypeId = data.activityTypeId;

  if (curTime < startTime) {
    resp.code = 0;
    resp.msg = '活动未开始';
    return resp;
  }
  if (curTime >= endTime) {
    resp.code = 0;
    resp.msg = '活动已结束';
    return resp;
  }

  if (data.command != command) {
    resp.code = 0;
    resp.msg = '口令错误';
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
      resp.msg = '查询已报名失败';
    });

  if (resp.msg) return resp;

  if (res.data.length <= 0) {
    curTime = new Date().getTime();
    res = await db.collection('activity_sign').add({
      data: {
        activityId,
        createTime: curTime,
        userId,
        signed: true,
        signTime: curTime,
        clocked: true,
        clockTime: curTime
      }
    });
    if (resp.msg) return resp;
  } else {
    const record = res.data[0];

    if (record.clocked) {
      resp.code = 0;
      resp.msg = '您已打过卡了';
      return resp;
    }

    res = await db
      .collection('activity_sign')
      .where({
        activityId,
        userId
      })
      .update({
        data: {
          clockTime: curTime,
          clocked: true
        }
      });
  }

  // 添加打卡积分
  const catchErr = () => console.error('userId', userId, `添加活动(${activityId})-打卡积分失败`);
  const catchLogErr = () => console.error('userId', userId, `添加活动(${activityId})-打卡积分明细失败`);

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
                  fromType: 'clock',
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
                  fromType: 'clock',
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
  resp.msg = '打卡成功';

  return resp;
};
