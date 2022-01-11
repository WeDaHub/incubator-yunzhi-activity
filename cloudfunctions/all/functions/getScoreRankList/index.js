const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  const { activityTypeId, pageIndex, pageSize, orgId = 'yunzhi' } = event;
  const $ = db.command.aggregate;
  const where = { orgIds: $.in([orgId]) };
  const data = await db
    .collection('user')
    .aggregate()
    .lookup({
      from: 'user_score_log',
      let: {
        userId: '$userId'
      },
      pipeline: $.pipeline()
        .match(db.command.expr($.and([$.eq(['$userId', '$$userId']), $.eq(['$activityTypeId', activityTypeId])])))
        .project({
          count: 1
        })
        .group({
          _id: null,
          totalCount: $.sum('$count')
        })
        .done(),
      as: 'score'
    })
    .match(where)
    .project({
      score: $.sum('$score.totalCount'),
      avatarUrl: 1,
      userName: 1,
      _id: 1
    })
    .sort({
      score: -1
    })
    .skip((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .end()
    .then((res) => res.list)
    .catch((err) => {
      resp.code = 0;
      resp.msg = '获取积分列表失败';
    });

  if (resp.msg) return resp;
  resp.code = 1;
  resp.msg = 'ok';
  resp.data = data;

  return resp;
};
