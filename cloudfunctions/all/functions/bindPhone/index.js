const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  let phoneNumber = '';

  const serviceRes = await cloud.getOpenData({
    list: [event.cloudId]
  });

  if (serviceRes.list.length > 0) {
    phoneNumber = serviceRes.list[0].data.phoneNumber;
    await db
      .collection('user')
      .where({ userId: event.userId })
      .update({
        data: {
          phoneNumber: phoneNumber,
          updateTime: +new Date()
        }
      });
    resp.code = 1;
    resp.msg = '绑定手机成功';
  } else {
    resp.code = 0;
    resp.msg = '获取手机号失败';
  }

  resp.data = {
    hasPhone: true,
    phoneNumber
  };
  return resp;
};
