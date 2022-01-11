const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  const { userId } = event;
  const data = await db
    .collection('user')
    .where({ userId })
    .get()
    .catch((err) => {
      resp.code = 0;
      resp.msg = '获取用户信息失败';
    });

  if (resp.msg) return resp;
  resp.code = 1;
  resp.msg = 'ok';
  resp.data = (data.data && data.data[0]) || {};

  return resp;
};
