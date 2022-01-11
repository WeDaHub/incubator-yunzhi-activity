const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const res = await db
    .collection('activity_type')
    .get()
    .catch(() => {
      resp.code = 0;
      resp.msg = '获取列表失败';
    });

  if (resp.msg) return resp;

  resp.code = 1;
  resp.data = res.data;

  return resp;
};
