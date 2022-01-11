const cloud = require('wx-server-sdk');
const dayjs = require('dayjs');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };
  resp.code = 0;
  resp.msg = '活动不存在';

  const activityRes = await db
    .collection('activity')
    .where({
      activityId: event.activityId
    })
    .get();

  if (activityRes.data.length > 0) {
    const remark = activityRes.data[0].useClock ? '报名成功可获得5积分，签到能得10积分！' : '报名成功可获得5积分！';
    const startTime = dayjs(activityRes.data[0].startTime).format('YYYY-MM-DD HH:mm:ss');
    const endTime = dayjs(activityRes.data[0].endTime).format('YYYY-MM-DD HH:mm:ss');

    const msgResult = await cloud.openapi.subscribeMessage.send({
      touser: event.openId,
      templateId: '', // TODO: 消息模板ID
      miniprogramState: 'developer', // TODO
      data: {
        thing21: {
          value: activityRes.data[0].name
        },
        thing20: {
          value: activityRes.data[0].presenter
        },
        date22: {
          value: startTime
        },
        date23: {
          value: endTime
        },
        thing11: {
          value: remark
        }
      }
    });
    console.info('msgResult=', msgResult);

    resp.code = 1;
    resp.msg = '报名成功';
  }

  resp.data = {};
  return resp;
};
