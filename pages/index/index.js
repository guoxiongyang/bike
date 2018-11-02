//导包

var myUtils = require("../../utils/myUtils.js")


Page({
  data: {
    longitude: 0,
    latitude: 0,
    controls: [],
    markers: []
  },
  //首次加载页面时调用
  onLoad: function () {
    var that = this;

    wx.getLocation({
      success: function(res) {
        var longitude=res.longitude
        var latitude=res.latitude
        that.setData({
          longitude: longitude,
          latitude: latitude
        }) 
        //查找单车
        findBikes(longitude,latitude,that)
      },
    })

    wx.getSystemInfo({
      success: function(res) {
        var windowWidth= res.windowWidth;
        var windowHeight= res.windowHeight;
        that.setData({
          controls: [
            //扫码按钮
            {
              id: 1,
              iconPath: '/images/qrcode.png',
              position: {
                width: 100,
                height: 60,
                left: windowWidth/2-50,
                top: windowHeight-80
              },
              //控件是否可点击
              clickable: true
              
            },
            //重定位按钮
            {
              id: 2,
              iconPath: '/images/img1.png',
              position: {
                width: 40,
                height: 40,
                left: 10,
                top: windowHeight-60,
              },
              clickable: true
            },
            //中心点位置
            {
              id: 3,
              iconPath: '/images/location.png',
              position: {
                width: 20,
                height: 35,
                left: windowWidth / 2 - 10,
                top: windowHeight / 2 - 40,
              },
              clickable: true
            },
            //充值按钮
            {
              id: 4,
              iconPath: '/images/pay.png',
              position: {
                width: 40,
                height: 40,
                left: windowWidth-45,
                top: windowHeight-100
              },
              clickable: true
            },
            //添加车辆
            {
              id: 5,
              iconPath: '/images/add.png',
              position: {
                width: 35,
                height: 35
              },
              clickable: true
            },
            //报修按钮
            {
              id: 6,
              iconPath: '/images/warn.png',
              position: {
                width: 35,
                height: 35,
                left: windowWidth - 42,
                top: windowHeight -60
              },
              clickable: true
            }
          ]
        })

      },
    })

    
  },
  //移动后地图视野发生变化触发的事件
  /*
  regionchange: function(e){
    var that = this;
    var etype = e.type;
    if(etype=='end'){
      this.mapCtx.getCenterLocation({
          success: function(res){
            that.setData({
              longitude: res.longitude,
              latitude: res.latitude
            })
          }
        })
    }
  },
  */
  //控件被点击事件
  controltap: function(e) {
    var that =this;
    var cid = e.controlId;
    switch(cid){
      //扫码按钮
      case 1 : {
        var status = myUtils.get("status")
        //根据用户状态，跳转到对应页面
        //如果是0，跳转到手机注册页面
        //如果是1，跳转到押金充值页面
        //如果是2，跳转到实名认证页面
        if(status == 0){
          wx.navigateTo({
            url: '../register/register',
          })
        }else if(status == 1){
          wx.navigateTo({
            url: '../deposit/deposit',
          })
        }else if(status ==2){
          wx.navigateTo({
            url: '../identify/identify',
          })
        }
        break;
      }
      //定位按钮
      case 2 : {
        this.mapCtx.moveToLocation()
        break;
      }
      //添加车辆按钮
      case 5 : {
        //var bike = that.data.markers;
        //获取到移动后的位置的中心点
        this.mapCtx.getCenterLocation({
          success: function (res) {
            var longitude = res.longitude;
            var latitude = res.latitude;
            // bike.push({
            //   iconPath: '/images/bike.png',
            //   width: '35',
            //   height: '40',
            //   longitude: log,
            //   latitude: lat
            // })
            // that.setData({
            //   markers: bike
            // })
            //将添加单车的数据发送到后台（springboot）
            wx.request({
              url: "http://localhost:8080/bike/add",
              data:{
                longitude:longitude,
                latitude:latitude,
                statu: 0
              },
              method:'POST',
              success: function(res){
                //查找单车，然后将单车显示在页面上
                findBikes(longitude,latitude,that)
              }
            })
          }
        })
        break;
      }
    }
  },
  //页面首次完成渲染
  onReady: function(e) {
    //创建map上下文
    this.mapCtx = wx.createMapContext('myMap')
  }
})


function findBikes(longitude,latitude,that){
  wx.request({
    url: 'http://localhost:8080/bike/findNear',
    method: 'GET',
    data: {
      longitude: longitude,
      latitude: latitude
    },
    success: function(res){
      //console.log(res)
      var bikes = res.data.map((bike) => {
        return{
          longitude: bike.longitude,
          latitude: bike.latitude,
          id: bike.id,
          iconPath: "/images/bike.png",
          width: '35',
          height: '40',
        }
      })
      //将bike的数组set到当前的页面的markers中
      that.setData({
        markers: bikes
      })
    }
  })
}
