var timer //计时器
var videoAd = null // 视频激励广告
const app = getApp()
// pages/main/main.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: "开始",
        flag: false,
        minute: "00",
        second: "00",
        showMouth: false,
        showHand: false,
        showFoot: false,
        easterEggTxt: "坚持哦后面会有4个彩蛋哦"

    },

    // 启动平板撑计时
    start: function () {
        let $this = this

        let dateYMDHM = app.dateFormat("YYYY-mm-dd HH:MM", new Date());
        let dateYMD = app.dateFormat("YYYY-mm-dd", new Date());

        //改变标题
        let flag = this.data.flag
        let title = "开始"
        let easterEggTxt = "坚持哦后面会有4个彩蛋哦"
        if (!flag) {

            //开始计时
            title = "停止"
            let millisecond = 0
            let second = 0
            let minute = 0
            let currentSecondTotal = 0
            //清理原来的计时器
            clearInterval(timer)
            timer = setInterval(function () {
                second++
                currentSecondTotal++
                if (second > 59) {
                    minute++;
                    second = 0
                    $this.setData({
                        minute: $this.handleTime(minute)
                    })
                }
                $this.setData({
                    second: $this.handleTime(second)
                })
                if (currentSecondTotal >= 90) {
                    $this.setData({
                        showMouth: true,
                        easterEggTxt: "不错哦，你已经坚持90秒，哈哈发现笑脸了吗"
                    })
                }
                if (currentSecondTotal >= 300) {
                    $this.setData({
                        showHand: true,
                        easterEggTxt: "哇哦真棒，你已经坚持五分钟了，哈哈发现了有啥不同没"
                    })
                }
                if (currentSecondTotal >= 491) {
                    $this.setData({
                        showFoot: true,
                        easterEggTxt: "你太棒了，打破了我的平板撑记录491秒，哈哈握个爪"
                    })
                }

            }, 1000)
        } else {
            //停止计时 即清除计时器
            clearInterval(timer);
            //由于暂时还没做后台，暂时存储在缓存里面 当大于0秒的时候存储
            let seconds = parseInt(this.data.minute * 60) + parseInt(this.data.second);
            if (seconds > 0) {
                try {
                    // 存储单次记录
                    let storageInfo = wx.getStorageSync('storageInfo')
                    if (storageInfo === '') {
                        let storageInfo = {} //待缓存的所有数据信息
                        storageInfo.recordArr = [] //单条数据
                        storageInfo.totalSecond = 0; //总秒数
                        wx.setStorageSync("storageInfo", JSON.stringify(storageInfo))
                    }
                    storageInfo = wx.getStorageSync('storageInfo')
                    storageInfo = JSON.parse(storageInfo);
                    storageInfo.recordArr.unshift({
                        "time": dateYMDHM,
                        "seconds": seconds
                    })
                    storageInfo.totalSecond += seconds
                    wx.setStorageSync('storageInfo', JSON.stringify(storageInfo))

                    // 更新这一天的总记录
                    let recentRecords = wx.getStorageSync('recentRecords')
                    recentRecords = recentRecords === '' ? [] : JSON.parse(recentRecords);
                    if (recentRecords.length > 0) { //如果已有存储记录 
                        if (recentRecords[0].time === dateYMD) {
                            //并且当天不是第一次使用计时器 则改变当天的总秒数即可
                            recentRecords[0].seconds = storageInfo.totalSecond
                        } else {
                            //否则 新增一条今天的记录
                            recentRecords.unshift({
                                "time": dateYMD,
                                "seconds": storageInfo.totalSecond
                            })

                            let lastRecord = recentRecords[recentRecords.length - 1]
                            if (app.getDays(lastRecord.time, dateYMD) > 30) { //如果缓存已经有30天(有30条数据了)的记录了，则清理掉最久的那条数据
                                recentRecords.pop();
                            }
                        }
                    } else { //如果是第一次使用小程序或者是清理了缓存再使用时 直接追加当天的总记录
                        recentRecords.unshift({
                            "time": dateYMD,
                            "seconds": storageInfo.totalSecond
                        })
                    }
                    wx.setStorageSync('recentRecords', JSON.stringify(recentRecords))

                    this.reset()
                } catch (e) {
                    console.log(e)
                }
            }
        }

        this.setData({
            flag: !this.data.flag,
            title: title
        })
    },

    //重置
    reset: function () {
        this.setData({
            minute: "00",
            second: "00",
            millisecond: "00"
        })
    },

    //重置所有，页面关闭小程序的时候
    restAll: function () {
        clearInterval(timer);
        this.setData({
            title: "开始",
            flag: false,
            minute: "00",
            second: "00"
        })
    },

    //处理计时值
    handleTime: function (second) {
        if (second < 10) {
            return "0" + second;
        }
        return second
    },

    // 查看排行榜
    viewRanking: function () {
        app.developing()
    },

    //邀请好友
    inviteFirend: function () {
        app.developing()
    },

    //查看个人记录
    record: function () {
        // 用户触发广告后，显示激励视频广告
        if (videoAd) {
            videoAd.show().catch(() => {
                // 失败重试
                videoAd.load()
                    .then(() => videoAd.show())
                    .catch(err => {
                        console.log('激励视频 广告显示失败')
                    })
            })
        }
    },

    longHand: function () {
        wx.showToast({
            title: '坚持哦',
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 在页面onLoad回调事件中创建激励视频广告实例
        if (wx.createRewardedVideoAd) {
            videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-ced042d45b398aa8'
            })

            videoAd.onError((err) => {})
            videoAd.onClose((res) => {
                if (res && res.isEnded || res === undefined) {
                    // 看完广告进入个人记录
                    wx.navigateTo({
                        url: '../record/record'
                    })
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },



    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})