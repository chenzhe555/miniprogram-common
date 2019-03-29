//index.js
//获取应用实例
const app = getApp();
import ToastUtil from '../../common/utils/toast-util';
import { login } from '../../http/TestRequest';

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    });
  },
  test1: function() {
    login()
      .then(res => {
        console.log('成功...', res);
      })
      .catch(error => {
        console.log('失败...', error);
      });

    ToastUtil.showToast('Toast1');
    ToastUtil.showToast('Toast2');
    ToastUtil.showToast('Toast3');
    ToastUtil.showToast('Toast4');
    ToastUtil.showToast('Toast5');
    ToastUtil.showToast('Toast6', { key: '666' });
    ToastUtil.showToast('Toast7');
    ToastUtil.showToast('Toast8');
    setTimeout(() => {
      ToastUtil.hideToast('666');
    }, 1000);
  },
  onLoad: function() {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
  },
  getUserInfo: function(e) {
    console.log(e);
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
  }
});
