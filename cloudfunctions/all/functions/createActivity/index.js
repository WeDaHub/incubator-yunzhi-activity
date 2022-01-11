const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const resp = { code: 0, msg: '', data: null };

  const date = new Date();
  const rand = Math.floor(Math.random() * 1000);
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  let status = '';

  if (date.getTime() < event.startTime) {
    status = 'waiting';
  } else if (date.getTime() < event.endTime) {
    status = 'running';
  } else {
    status = 'finish';
  }
  const isEdit = !!event.activityId;
  const activityId = event.activityId || `${event.orgId}-${date.getTime()}-${rand}`;
  let records = {};
  if (isEdit) {
    records = {
      data: {
        activityTypeId: event.activityTypeId,
        command: event.command,
        content: event.content,
        endTime: +endTime,
        introImgUrl: event.introImgUrl,
        name: event.name,
        presenter: event.presenter,
        startTime: +startTime,
        updateTime: +date,
        useClock: event.useClock,
        address: event.address
      }
    };
  } else {
    records = {
      data: {
        activityId,
        activityTypeId: event.activityTypeId,
        command: event.command,
        content: event.content,
        createTime: +date,
        creator: event.userId,
        endTime: +endTime,
        introImgUrl: event.introImgUrl,
        name: event.name,
        orgId: event.orgId,
        presenter: event.presenter,
        startTime: +startTime,
        status,
        updateTime: +date,
        useClock: event.useClock,
        useSignUp: event.useSignUp,
        address: event.address
      }
    };
  }

  console.log('createActivity start', records);

  const dbRes = db.collection('activity');

  let res;
  if (isEdit) {
    res = await dbRes
      .where({ activityId })
      .update(records)
      .catch(() => {
        resp.code = 0;
        resp.msg = '更新活动失败';
      });
  } else {
    res = await dbRes.add(records).catch(() => {
      resp.code = 0;
      resp.msg = '创建活动失败';
    });
  }
  console.log('createActivity end', res);

  if (resp.msg) return resp;

  resp.code = 1;
  resp.data = {
    id: activityId
  };

  return resp;
};
