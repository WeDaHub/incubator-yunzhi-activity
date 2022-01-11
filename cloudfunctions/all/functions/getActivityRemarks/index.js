const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const { activityId, userId } = event;

  const signRes = await db
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

  let record = signRes.list ? signRes.list[0] : null;

  if (!record) {
    resp.code = 0;
    resp.msg = '活动不存在';
    return resp;
  }

  const res = await db
    .collection('activity_remark')
    .aggregate()
    .match({
      activityId
    })
    .lookup({
      from: 'user',
      localField: 'userId',
      foreignField: 'userId',
      as: 'user'
    })
    .replaceRoot({
      newRoot: $.mergeObjects([$.arrayElemAt(['$user', 0]), '$$ROOT'])
    })
    .project({
      user: 0,
      remarkedId: 0
    })
    .end()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取列表失败';
    });

  if (resp.msg) return resp;

  const canRes = await db
    .collection('activity_remark')
    .where({
      activityId,
      userId
    })
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取列表失败';
    });

  if (resp.msg) return resp;

  let canRemark = (record.useClock ? !!record.clocked : !!record.signed) ? (canRes.data ? canRes.data.length <= 0 : true) : false;

  resp.code = 1;
  resp.data = {
    list: res.list,
    canRemark
  };
  resp.msg = '获取成功';

  return resp;
};
