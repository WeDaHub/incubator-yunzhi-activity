import { fetch, callFunction } from '../deps';

export const getpracticeresult = (data = {}, options = {}) => {
  return fetch('POST', '/v1/adaptiveevaluationsvc/getpracticeresult', { ...data }, { ...options });
};

export const cfGetTestInfo = (data = {}, options = {}) => {
  return callFunction('getTestInfo', { ...data }, { ...options });
};
