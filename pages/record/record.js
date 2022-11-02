// pages/record/record.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabFlag: 0,
    btns: ["今日记录", "近7天", "近30天"],
    todayRecords: [],
    recent7Records: [],
    recent30Records: [],
    todayTotalSecond: 0,
    recent7TotalSecond: 0,
    recent30TotalSecond: 0
  },

  //切换记录
  changeRecord: function (e) {
    this.setData({
      tabFlag: parseInt(e.target.dataset.tabFlag)
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let dateYMD = app.dateFormat("YYYY-mm-dd", new Date());
    this.clearYesterdayRecord(dateYMD);
    // 当天记录数据
    let storageInfo = wx.getStorageSync('storageInfo')
    if (storageInfo != '') {
      storageInfo = JSON.parse(storageInfo);
      let recordArr = storageInfo.recordArr;
      // 看今天是否第一次打开今日记录 是则清楚上一天的详细记录
      if (recordArr.length > 0) {
        let lastRecordTime = recordArr[0].time
        let lastRecordDate = lastRecordTime.split(" ")[0]
        if(parseInt(app.getDays(lastRecordDate,dateYMD))>0){
          wx.removeStorageSync('storageInfo')
        }else{
          this.setData({
            todayRecords: recordArr,
            todayTotalSecond: storageInfo.totalSecond
          })
        }
      }
    }
    // 最近30天记录数据
    let recent30Records = wx.getStorageSync('recentRecords')
    if (recent30Records != '') {
      recent30Records = JSON.parse(recent30Records);
      let recent7Records = []
      let recent7TotalSecond = 0
      let recent30TotalSecond = 0
      for (let i = 0; i < recent30Records.length; i++) {
        recent30TotalSecond += recent30Records[i].seconds
        if (parseInt(app.getDays(recent30Records[i].time, dateYMD)) <= 8) {
          recent7Records.push(recent30Records[i])
          recent7TotalSecond += recent30Records[i].seconds
        }
      }

      this.setData({
        recent7Records: recent7Records,
        recent30Records: recent30Records,
        recent7TotalSecond: recent7TotalSecond,
        recent30TotalSecond: recent30TotalSecond
      })
    }
  },

  // 清理昨天的记录，今日记录只保存今天的记录
  clearYesterdayRecord:function(dateYMD){
    let storageInfo = wx.getStorageSync('storageInfo');
    if (storageInfo != '') {
      storageInfo = JSON.parse(storageInfo);
      let recordArr = storageInfo.recordArr;
      // 如果存在今日记录缓存数据中，则每次打开【我的今日记录】时清理掉昨天的缓存记录
      if (recordArr.length > 0) {
        let lastRecord = recordArr[recordArr.length - 1];
        //当今日记录日期和今天日期相差一天及以上时，则清理掉昨天的记录
        if (app.getDays(lastRecord.time.split(" ")[0], dateYMD) > 0) {
          recordArr.pop();
          storageInfo.recordArr = recordArr;
          storageInfo.totalSecond = storageInfo.totalSecond - lastRecord.seconds;
          wx.setStorageSync('storageInfo', JSON.stringify(storageInfo));
        }
      }
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
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

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