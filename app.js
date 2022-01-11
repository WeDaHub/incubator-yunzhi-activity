"use strict";
App({
    globalData: {},
    onLaunch: function () {
        if (!wx.cloud) {
            console.error("请使用 2.2.3 或以上的基础库以使用云能力");
        }
        else {
            wx.cloud.init({
                env: '', // TODO: 云开发env配置
                traceUser: true,
            });
        }
        var updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            console.log('hasUpdate', res.hasUpdate);
        });
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        updateManager.applyUpdate();
                    }
                }
            });
        });
        updateManager.onUpdateFailed(function () {
        });
    }
});
