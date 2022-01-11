const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const $ = db.command.aggregate;

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const { activityId, userId } = event;

  const res = await db
    .collection('activity_sign')
    .aggregate()
    .match({
      activityId,
      clocked: true
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
      roleTypeIds: 0,
      orgIds: 0,
      phoneNumber: 0,
      createTime: 0,
      updateTime: 0
    })
    .end()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取活动打卡人员列表失败';
    });

  if (resp.msg) return resp;

  resp.code = 1;
  resp.data = res.list;
  resp.msg = '获取成功';

  return resp;
};
