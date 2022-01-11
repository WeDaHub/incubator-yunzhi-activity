const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  const { userId } = event;
  const res = await db
    .collection('activity_type')
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取积分信息失败';
    });
  const ret = res.data ? res.data.map((f) => ({ activityTypeId: f.activityTypeId, activityTypeName: f.activityTypeName, score: 0 })) : [];

  const data = await db
    .collection('user_score_log')
    .where({ userId })
    .get()
    .catch((err) => {
      resp.code = 0;
      resp.msg = '获取积分信息失败';
    });

  if (resp.msg) return resp;
  if (data && data.data) {
    data.data.forEach((item) => {
      const sign = ret.find((f) => f.activityTypeId === item.activityTypeId);
      if (sign) sign.score += Number(item.count || '0');
    });
  }
  resp.code = 1;
  resp.msg = 'ok';
  resp.data = ret;

  return resp;
};
