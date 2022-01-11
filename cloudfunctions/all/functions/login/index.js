const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  let loginType = '';
  let hasPhone = false;

  // collectionRes { errMsg: '', data: [] }
  const userRes = await db
    .collection('user')
    .where({
      userId: event.userId
    })
    .get();

  if (userRes.data.length < 1) {
    await db.collection('user').add({
      data: {
        orgIds: [event.orgId],
        roleTypeIds: ['normal'],
        gender: event.gender,
        avatarUrl: event.avatarUrl,
        province: event.province,
        city: event.city,
        userName: event.nickName,
        userId: event.userId,
        openId: event.openId,
        unionId: '',
        phoneNumber: '',
        qywxEnName: '',
        qywxCnName: '',
        createTime: +new Date(),
        updateTime: +new Date()
      }
    });
    loginType = '新增成功';
  } else {
    await db
      .collection('user')
      .where({ userId: event.userId })
      .update({
        data: {
          avatarUrl: event.avatarUrl,
          province: event.province,
          city: event.city,
          userName: event.nickName,
          // userId: event.userId,
          // openId: event.openId,
          updateTime: +new Date()
        }
      });
    loginType = '更新成功';
    hasPhone = !!userRes.data[0].phoneNumber;
  }
  console.info('userRes=', userRes);

  resp.code = event.key == 0 ? 0 : 1;
  resp.msg = '登录成功';
  resp.data = {
    loginType,
    hasPhone,
    userId: event.userId
  };
  return resp;
};
