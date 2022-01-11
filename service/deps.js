import { SERVE_URL } from '../config/index';

/**
 * @function
 * @name fetch
 * @param {String} method GET/POST/PUT...
 * @param {String} url 接口URL
 * @param {Object} data 请求参数
 * @param {Object} options 配置
 * @return {Response}
 */
export const fetch = (method, url, data, options) => {
  // loading
  const loadingTxt = (options && options.loadingTxt) || '正在加载';
  if (options && options.showLoading) wx.showLoading({ mask: true, title: loadingTxt });
  // token
  const token = wx.getStorageSync('token') || '';
  return new Promise(function (resolve, reject) {
    wx.request({
      method,
      url: `${SERVE_URL}${url}`,
      header: {
        Authorization: token
      },
      data: data || {},
      timeout: 30000,
      success(res) {
        // console.log('success', res.statusCode, res)
        /**
         * res => {data:{}, cookies: [], errMsg: 'request:ok', header: {}, statusCode: 200}
         * statusCode 200,404,500
         */
        if (res.data.ErrorCode === 'OK') {
          resolve(res.data);
        } else {
          if ('401' == res.data.ErrorCode || '会话过期，请重新登录' === res.data.ErrorMsg) {
            if (options && options.noAuth) options.noAuth();
            return;
          }
          if (options && options.showRejMsg) {
            const errMsg = res.data.ErrorMsg || res.data.Detail;
            wx.showToast({ title: errMsg, icon: 'none', duration: 2000 });
          }
          reject(res.data);
        }
      },
      fail(err) {
        /**
         * 网络异常 net::ERR_TUNNEL_CONNECTION_FAILED
         */
        wx.showToast({ title: err.errMsg || '接口调用失败', icon: 'none', duration: 3000 });
        console.error(err);
      },
      complete() {
        wx.hideLoading();
      }
    });
  });
};

/**
 * @function
 * @name callFunction
 * @param {String} name - 函数名
 * @param {Object} data 请求参数
 * @param {Object} options 配置
 * @return {Response}
 */
export const callFunction = (name, data, options) => {
  const loadingTxt = (options && options.loadingTxt) || '正在加载';
  if (options && options.showLoading) wx.showLoading({ mask: true, title: loadingTxt });

  return new Promise(function (resolve, reject) {
    wx.cloud
      .callFunction({
        name,
        data: { ...data }
      })
      .then((res) => {
        wx.hideLoading();
        // res => {result:{code:0, data:{}, msg: ''}, requestID: '', errMsg: ''}
        if (res.result.code === 0) {
          resolve(res.result.data);
        } else {
          if (options && options.showRejMsg && res.result.msg) {
            wx.showToast({ title: res.result.msg, icon: 'none', duration: 2000 });
          }
          reject(res.result.data);
        }
      })
      .catch((err) => {
        /**
         * 请求的方法名不对
         * 网络异常
         */
        wx.hideLoading();
        wx.showToast({ title: err.errMsg || '接口调用失败', icon: 'none', duration: 3000 });
        console.error(JSON.stringify(err));
      });
  });
};
