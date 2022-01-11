const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  const { activityTypeId, pageIndex = 1, pageSize = 10, orgId = 'yunzhi' } = event;
  const where = { orgId };
  // activityTypeId 活动热榜 活动类型ID
  if (activityTypeId) where.activityTypeId = activityTypeId;
  const data = await db
    .collection('activity')
    .aggregate()
    .lookup({
      from: 'activity_sign',
      localField: 'activityId',
      foreignField: 'activityId',
      as: 'sign'
    })
    .match(where)
    .sort({
      startTime: -1
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
  let ret = data.map((item) => ({
    ...item,
    sign: item.sign.length,
    startTime: Number(item.startTime || '0')
  }));
  // 活动热榜根据人数排序
  if (activityTypeId) {
    ret = ret.sort((a1, a2) => a2.sign - a1.sign);
  } else {
    // 最新活动 根据开始时间排序
    const now = Date.now();
    const futureList = ret.filter((f) => now - f.startTime <= 0).sort((a1, a2) => a1.startTime - a2.startTime);
    const pastList = ret.filter((f) => now - f.startTime > 0).sort((a1, a2) => a2.startTime - a1.startTime);
    ret = [...futureList, ...pastList];
  }
  resp.data = ret;

  return resp;
};
