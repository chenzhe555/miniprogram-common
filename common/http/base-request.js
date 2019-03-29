import { RequestFailType } from './request-enum';
export default class BaseRequest {
  /*************************************************************属性*************************************************************/

  //默认Header体
  defaultHeader = { 'content-type': 'application/json' };
  //默认请求参数
  params = {};
  //请求任务结构体
  requestTask = null;
  //请求失败状态值
  requestFailType = RequestFailType.Fail;
  //请求成功回调
  successCallback = null;
  //请求失败回调
  failCallback = null;
  //总请求次数
  retryCount = 1;
  //请求配置
  requestConfig = {};

  /*************************************************************外部调用的方法*************************************************************/
  /*
    POST请求
    url: 请求地址
    params: 请求参数
    success: 成功回调
    fail: 失败回调
    config: 额外配置信息
   */
  post = (
    url = '',
    params = null,
    success = null,
    fail = null,
    config = {}
  ) => {
    //如果请求地址为空，返回
    if (url.length <= 0) return;

    //添加自定义信息
    this.addCustomHeader().addCustomParams(params);
    //配置成功失败回调事件
    this.successCallback = success;
    this.failCallback = fail;
    //设置请求配置
    this.requestConfig = {
      url: url,
      data: this.params,
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      header: this.defaultHeader,
      success: this.requestSuccess,
      fail: this.requestFail
    };
    //发起请求
    this.requestWXApi();
  };

  /*************************************************************内部调用方法*************************************************************/
  /*
    发起微信请求
  */
  requestWXApi = () => {
    --this.retryCount;
    this.requestTask = wx.request(this.requestConfig);
  };

  /*
  请求成功回调
  */
  requestSuccess = res => {
    //重置请求次数
    this.retryCount = 0;
    let statusCode = res.statusCode || 0;
    //只对状态码200处理成功
    if (statusCode == 200) {
      this.handleRequestSuccess(res);
    } else {
      //非200的情况
      this.requestFailType = RequestFailType.StatusCodeFail;
      res['errMsg'] = String(res['data']);
      this.handleRequestFail(res);
    }
  };
  /*
请求失败回调
*/
  requestFail = res => {
    //重试
    if (this.retryCount > 0) {
      this.requestWXApi();
    } else {
      this.requestFailType = RequestFailType.Fail;
      this.handleRequestFail(res);
    }
  };

  /*************************************************************子类重写方法*************************************************************/
  /*
  添加自定义Header体
  */
  addCustomHeader = (config = {}) => {
    //子类重写
    return this;
  };

  /*
  获取非200错误信息,
  */
  getStatusCodeInfo = (statusCode = 0) => {
    //子类可重写
    let hundred = parseInt(statusCode) / 100;
    let decade = parseInt(statusCode) % 100;
    let codeDic = { statusCode: statusCode, msg: '' };
    switch (hundred) {
      case 1:
        {
          codeDic['msg'] = '请求方式待优化';
        }
        break;
      case 2:
        {
          codeDic['msg'] = '请求成功，有额外信息返回';
        }
        break;
      case 3:
        {
          codeDic['msg'] = '当前请求重定向等等...';
        }
        break;
      case 4:
        {
          switch (decade) {
            case 0:
              {
                codeDic['msg'] = '请求无法解析，请检查后重试';
              }
              break;
            case 3:
              {
                codeDic['msg'] = '请求拒绝执行';
              }
              break;
            case 4:
              {
                codeDic['msg'] = '请求不存在';
              }
              break;
            default:
              {
                codeDic['msg'] = '拒绝服务';
              }
              break;
          }
        }
        break;
      case 5:
        {
          switch (decade) {
            case 0:
              {
                codeDic['msg'] = '服务器异常，请稍候重试';
              }
              break;
            default:
              {
                codeDic['msg'] = '服务器异常无法响应请求，请检查后重试';
              }
              break;
          }
        }
        break;
      default:
        break;
    }
    return codeDic;
  };

  /*
  添加自定义参数
  */
  addCustomParams = (params = {}) => {
    //子类重写
    return this;
  };

  handleRequestFail = res => {
    //子类重写
  };

  handleRequestSuccess = res => {
    //子类重写
  };
}
