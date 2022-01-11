const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
// const db = cloud.database()

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  // event 中获取页面请求参数+index云函数中追加的请求参数
  // db.collection查询结果{ errMsg: '', data: [] }
  // TODO service

  resp.code = event.key == 0 ? 0 : 1;
  resp.msg = '请求成功';
  resp.data = [
    {
      name: '',
      phone: ''
    }
  ];
  return resp;
};
