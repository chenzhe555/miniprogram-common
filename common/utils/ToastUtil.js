//显示策略
const ToastUtilShowStrategy = {
  Immediately: 1,
  Queue: 2
};

//显示失败策略
const ToastUtilShowFailStrategy = {
  Continue: 1,
  Retry: 2
};

export default class ToastUtil {
  /*************************************************************属性*************************************************************/

  static isShowingToast = false;
  //通用Toast显示时间
  static CommonDuring = 1000;
  //显示队列
  static ShowQueue = [];
  //显示策略
  static ShowStrategy = ToastUtilShowStrategy.Queue;
  //显示失败策略
  static ShowFailStrategy = ToastUtilShowFailStrategy.Continue;
  //定时器
  static ShowTimeoutCallback;

  /*************************************************************对外提供的方法*************************************************************/
  /*
  显示Toast
  msg: 显示信息
  config: 配置信息 {icon, image, duration, mask, key}, 其中key不是官方提供的值，用于隐藏Toast的时候隐藏特定Toast
  */
  static showToast = (msg = '', config = {}) => {
    //空串 返回
    if (msg.length <= 0) return;

    //设置Toast相关配置信息
    let toastConfig = Object.assign(
      { title: msg, icon: 'none', duration: ToastUtil.CommonDuring },
      config
    );

    switch (ToastUtil.ShowStrategy) {
      case ToastUtilShowStrategy.Immediately:
        {
          //如果是立即，则直接执行微信Toast显示方法
          wx.showToast(toastConfig);
        }
        break;
      case ToastUtilShowStrategy.Queue:
        {
          //如果是走队列，则把配置文件放入队列，执行显示Toast操作
          ToastUtil.ShowQueue.push(toastConfig);
          if (!ToastUtil.isShowingToast) {
            ToastUtil.showToastFunc();
          }
        }
        break;
      default:
        break;
    }
  };

  /*
  隐藏Toast
  key: 隐藏特定key值的Toast
  */
  static hideToast = (key = '') => {
    switch (ToastUtil.ShowStrategy) {
      case ToastUtilShowStrategy.Immediately:
        {
          //如果是立即，则直接执行微信Toast隐藏方法
          wx.hideToast();
        }
        break;
      case ToastUtilShowStrategy.Queue:
        {
          //如果是走队列，则清除定时器和第一个配置信息或者特定key对应的
          if (ToastUtil.ShowQueue.length > 0) {
            //清除第一个配置信息
            let cleanIndex = 0;
            if (key.length > 0) {
              let config = null;
              //筛选出要清除的元素
              for (let i = 0; i < ToastUtil.ShowQueue.length; ++i) {
                config = ToastUtil.ShowQueue[i];
                if (config['key'] == key) {
                  cleanIndex = i;
                  break;
                }
              }
            }

            //清除并重新显示,如果是第一个，停止定时；如果不是第一个，直接删除数组元素即可
            ToastUtil.ShowQueue.splice(cleanIndex, 1);
            if (cleanIndex == 0) {
              clearTimeout(ToastUtil.ShowTimeoutCallback);
              ToastUtil.showToastFunc();
            }
          }
        }
        break;
      default:
        break;
    }
  };

  /*
  修改显示策略
  showStrategy: 1:前一个立即消失 2.依次消失
  */
  static modifyShowStrategy = (showStrategy = 1) => {
    ToastUtil.ShowStrategy = showStrategy;
  };

  /*************************************************************内部调用方法*************************************************************/
  /*
  显示Toast业务逻辑
  */
  static showToastFunc = () => {
    //如果队列里没有，则返回
    if (ToastUtil.ShowQueue.length <= 0) {
      ToastUtil.isShowingToast = false;
      return;
    }

    //取出队列中第一个配置文件
    let config = ToastUtil.ShowQueue[0];
    if (ToastUtil.ShowFailStrategy == ToastUtilShowFailStrategy.Retry) {
      //如果选择失败重试，则实现Fail方法
      config['fail'] = ToastUtil.showToastFail;
    }
    //显示Toast
    ToastUtil.isShowingToast = true;
    wx.showToast(config);
    //设置定时器
    ToastUtil.ShowTimeoutCallback = setTimeout(() => {
      //移除第一个配置
      ToastUtil.ShowQueue.shift();
      if (ToastUtil.ShowQueue.length > 0) {
        //如果还有，继续执行
        ToastUtil.showToastFunc();
      } else {
        //如果没有，不再执行
        ToastUtil.isShowingToast = false;
      }
    }, config['duration']);
  };

  /*
  wx.showToast调用失败，目前只对retry做处理
  */
  static showToastFail = () => {
    if (ToastUtil.ShowFailStrategy == ToastUtilShowFailStrategy.Retry) {
      //如果失败，清除定时器，并重新显示第一个配置
      clearTimeout(ToastUtil.ShowTimeoutCallback);
      ToastUtil.showToastFunc();
    }
  };
}
