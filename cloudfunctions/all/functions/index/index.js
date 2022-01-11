const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const resp = { code: 0, msg: '', data: null, baseData: {} };

  // 业务接口代理转发
  const serviceRes = await cloud.callFunction({
    name: event.action,
    data: {
      appId: wxContext.APPID,
      openId: wxContext.OPENID,
      unionId: wxContext.UNIONID,
      userId: event.orgId + wxContext.OPENID,
      ...event
    }
  });

  // 转发日志
  console.info('event=', event);
  console.info('userId=', event.orgId + wxContext.OPENID);
  console.info('serviceRes=', serviceRes);

  // baseData 是index云函数全局注入的数据，包含：role
  const userRes = await db
    .collection('user')
    .where({
      userId: event.orgId + wxContext.OPENID
    })
    .get();
  if (userRes.data.length > 0) {
    resp.baseData['isNormal'] = userRes.data[0].roleTypeIds.length === 1 && userRes.data[0].roleTypeIds[0] === 'normal';
    resp.baseData['isAdmin'] = userRes.data[0].roleTypeIds.includes('admin') || userRes.data[0].roleTypeIds.includes('superAdmin');
  }

  // 返回结果透传
  resp.code = serviceRes.result.code; // 业务状态码（1成功，0失败）
  resp.msg = serviceRes.result.msg || '请求成功';
  resp.data = serviceRes.result.data;

  return resp;
};
