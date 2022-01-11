const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  const { userId, pageIndex, pageSize } = event;
  const $ = db.command.aggregate;
  const data = await db
    .collection('activity')
    .aggregate()
    .lookup({
      from: 'activity_sign',
      let: {
        activityId: '$activityId'
      },
      pipeline: $.pipeline()
        .match(db.command.expr($.and([$.eq(['$activityId', '$$activityId'])])))
        .group({
          _id: null,
          count: $.sum(1)
        })
        .done(),
      as: 'sign'
    })
    .match({ creator: userId })
    .sort({
      createTime: -1
    })
    .skip((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .end()
    .then((res) => res.list)
    .catch((err) => {
      resp.code = 0;
      resp.msg = '获取活动列表失败';
    });

  if (resp.msg) return resp;
  resp.code = 1;
  resp.msg = 'ok';
  resp.data = data.map((item) => {
    return {
      name: item.name,
      introImgUrl: item.introImgUrl,
      address: item.address,
      activityId: item.activityId,
      sign: (item.sign[0] && item.sign[0].count) || 0,
      startTime: item.startTime
    };
  });

  return resp;
};
