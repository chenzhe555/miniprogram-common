import BaseRequest from '../common/http/base-request';
import { RequestFailType } from '../common/http/request-enum';

class Request extends BaseRequest {
  addCustomHeader = (config = {}) => {
    this.defaultHeader = Object.assign(this.defaultHeader, config);
    return this;
  };

  addCustomParams = (params = {}) => {
    this.params = Object.assign(this.params, params);
    return this;
  };

  handleRequestSuccess = res => {
    //此处可做业务额外处理
    let data = res.data || {};
    if (parseInt(data.ret) == 1) {
      if (!data['data']) data['data'] = {};
      if (this.successCallback) this.successCallback(data);
    } else {
      this.requestFailType = RequestFailType.ResultFail;
      this.handleRequestFail(res);
    }
  };

  handleRequestFail = res => {
    switch (this.requestFailType) {
      case RequestFailType.Fail:
        {
          //网络不行巴啦啦
        }
        break;
      case RequestFailType.StatusCodeFail:
        {
          let codeDic = this.getStatusCodeInfo();
        }
        break;
      case RequestFailType.ResultFail:
        {
          //ret = 0;
        }
        break;
      default:
        break;
    }
    res['fail_type'] = this.requestFailType;
    if (this.failCallback) this.failCallback(res);
  };
}

const request = new Request();
export { request };
