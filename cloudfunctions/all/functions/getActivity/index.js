const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const { activityId, userId } = event;

  let res = await db
    .collection('activity')
    .aggregate()
    .match({
      activityId
    })
    .lookup({
      from: 'activity_sign',
      let: {
        activity_id: '$activityId'
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([$.eq(['$userId', userId]), $.eq(['$activityId', '$$activity_id'])])))
        .project({
          _id: 0,
          clocked: 1,
          signed: 1
        })
        .done(),
      as: 'user'
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$user', 0]), '$$ROOT'])
    })
    .project({
      user: 0
    })
    .end()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取详情失败';
    });

  if (resp.msg) return resp;

  let record = res.list ? res.list[0] : null;

  if (!record) {
    resp.code = 0;
    resp.msg = '活动不存在';
    return resp;
  }
  record = {
    ...record,
    command: !!record.command
  };

  res = await db
    .collection('activity_sign')
    .where({
      activityId,
      signed: true
    })
    .count()
    .catch(() => {});

  const signedNum = res.total || 0;

  res = await db
    .collection('activity_sign')
    .where({
      activityId,
      clocked: true
    })
    .count()
    .catch(() => {});

  const clockedNum = res.total || 0;

  res = await db
    .collection('activity_remark')
    .where({
      activityId
    })
    .count()
    .catch(() => {});

  const remarkNum = res.total || 0;

  resp.code = 1;
  resp.data = {
    record,
    signedNum,
    clockedNum,
    remarkNum
  };

  return resp;
};
