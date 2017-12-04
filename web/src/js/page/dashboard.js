import Bus from "../bus" ;
import controlMap from "@/components/blockMoveComponents/BlockMoveComponents.vue" ;
import nodeList from "@/components/tableComponents/nodeList" ;
import sidebar from "@/components/sidebar/Sidebar.vue" ;
import Data from "../server/httpServer" ;

export default {
  data () {
    return {
      startDataSelect: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },
      endDataSelect: {
        disabledDate (time) {
          return time.getTime() > Date.now()
        }
      },

      activeName2: "realTimeData",

      realDataInfo: {rotationAngle: {}, coordinate: {}, rtkStationData: [], labelData: [], uwbStationData: []},
      historyDataInfo: {rotationAngle: {}, coordinate: {}, labelData: [], rtkStationData: [], uwbStationData: []},
      windowWidth: 0,
      region: [],
      reset: "",
      blockShow: true,
      clear: false,
      equipment: [],

      activeNode: "labelChange",

      isRealTimeData: true,

      startIndex: 0,
      playState: "播放",
      speed: "×2",
      isProgressBar: false,
      isTimeSelect: false,
      allTime: "",

      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",

      playProgress: 0,
      playTime: "0:0",
      historyStatus: false

    }
  },
  components: {
    controlMap: controlMap,
    sidebar: sidebar,
    nodeList: nodeList
  },
  mounted: function () {
    this.getUwbStationInfo()
    this.getGnssStationInfo()
    this.getLabelInfo()
    this.getRegion()
    var self = this
    if (self.isRealTimeData === true) {
      self.realDataInfo.coordinate = {
        "stationInfo": {},
        "labelInfo": {}
      }
      Bus.$on("rtkres_roverpos", function (data) {
        self.realDataInfo.labelData = self.updateLabel(self.realDataInfo.labelData, data, 1)
        self.realDataInfo.coordinate = self.roverCoor(self.realDataInfo.labelData, self.realDataInfo.coordinate, data, 1)
      })
      Bus.$on("user_uwb", function (data) {
        self.realDataInfo.labelData = self.updateLabel(self.realDataInfo.labelData, data, 1)
        self.realDataInfo.coordinate = self.roverCoor(self.realDataInfo.labelData, self.realDataInfo.coordinate, data, 1)
      })
      Bus.$on("user_stat", function (data) {
        self.realDataInfo.labelData = self.updateLabel(self.realDataInfo.labelData, data, 1)
      })
      Bus.$on("rtkres_attitude", function (data) {
        self.realDataInfo.rotationAngle = self.updateRotationAngle(self.realDataInfo.rotationAngle, data)
      })
      Bus.$on("status", function (data) {
        self.realDataInfo.uwbStationData = self.setTableStatus(self.realDataInfo.uwbStationData,data)
        self.realDataInfo.rtkStationData = self.setTableStatus(self.realDataInfo.rtkStationData,data)
        self.realDataInfo.labelData = self.setTableStatus(self.realDataInfo.labelData,data)
      })
    }
    window.onresize = function () {
      self.windowWidth = document.body.offsetWidth
    }

  },
  watch: {
    playProgress: function () {
      var self = this
      if (self.playProgress == 100) {
        self.playState = "播放"
      }
    }
  },
  methods: {
    handleClick(tab){
      var self = this
      if(tab.name === "realTimeData"){
        self.showRealTimeData()
      }
      else {
        self.showHistoryData()
      }
    },
    getLabelInfo () {
      var self = this
      return Data.getLabels()
        .then(function (result) {
          var colors = ["Crimson", "Blue", "PaleVioletRed", "DarkCyan", "DarkMagenta", "Indigo", "Cyan", "DarkSlateGray","DoderBlue", "SeaGreen", "Lime", "Yellow", "Olive", "GoldEnrod", "SaddleBrown", "RosyBrown", "Black", "Silver"]
          for (var i = 0; i < result.length; i++) {
            result[i].color = colors.shift() || "#"+(Math.random()*0xffffff<<0).toString(16)
          }
          self.realDataInfo.labelData = JSON.parse(JSON.stringify(result))
          return Promise.resolve()
        })
    },
    getUwbStationInfo () {
      var self = this
      return Data.getUwbStations()
        .then(function (result) {
          for (var i = 0; i < result.length; i++) {
            result[i].coordinate = result[i].x + "," + result[i].y + "," + result[i].z
          }
          self.realDataInfo.uwbStationData = JSON.parse(JSON.stringify(result))
          self.realDataInfo.coordinate = self.baseCoor(self.realDataInfo.uwbStationData, self.realDataInfo.coordinate)
          return Promise.resolve()
        })
    },
    getGnssStationInfo () {
      var self = this
      return Data.getGnssStations()
        .then(function (result) {
          for (var i = 0; i < result.length; i++) {
            result[i].coordinate = result[i].x + "," + result[i].y + "," + result[i].z
          }
          self.realDataInfo.rtkStationData = JSON.parse(JSON.stringify(result))
          setInterval(function () {
            self.realDataInfo.coordinate = self.baseCoor(self.realDataInfo.rtkStationData, self.realDataInfo.coordinate)
          })
          return Promise.resolve()
        })
    },
    updateLabel (labelInfo, data, number) {
      for (var i = 0; i < labelInfo.length; i++) {
        if (Number(data.nodeID) === Number(labelInfo[i].nodeID)) {
          if (data.battery !== undefined) {
            labelInfo[i].status = data.battery
          }
          if (data.x !== undefined) {
            if (data.z !== "") {
              if (data.stat == 0) {

              } else {
                labelInfo[i].coordinate = data.x / number + "," + data.y / number + "," + data.z / number
              }
            } else {
              labelInfo[i].coordinate = data.x / number + "," + data.y / number
            }
          }
          if (data.anchors !== undefined) {
            labelInfo[i].anchors = data.anchors.join()
          }
          if (data.satNum !== undefined) {
            if (data.stat == 0) {

            } else {
              labelInfo[i].satNum = data.satNum
            }
          }
        }
      }
      return JSON.parse(JSON.stringify(labelInfo))
    },
    setTableStatus: function (tableInfo,data) {
      for(var i=0;i<tableInfo.length; i++){
        for (var j=0;j<data.rtk.bases.length;j++){
          if(tableInfo[i].nodeID == data.rtk.bases[j].nodeID){
            tableInfo[i].status = data.rtk.bases[j].stat
          }
        }
        for(var k=0;k<data.uwb.bases.length;k++){
          if(tableInfo[i].nodeID == data.uwb.bases[k].nodeID){
            tableInfo[i].status = data.uwb.bases[k].stat
          }
        }
      }
      return tableInfo
    },
    showRealTimeData () {
      this.initHistroy()
      var self = this
      self.isRealTimeData = true
      self.blockShow = !self.blockShow
      window.clearInterval(self.isStartPlay)
    },
    showHistoryData () {
      var self = this

      self.isRealTimeData = false
      self.isTimeSelect = true
      window.clearInterval(self.isStartPlay)
    },
    progressBarShow () {
      this.isRealTimeData = true
    },
    play () {
      var self = this
      if (self.playState == "播放") {
        self.playState = "暂停"

        self.startPlay(self.frequency)
      } else {
        self.playState = "播放"
        window.clearInterval(self.isStartPlay)
      }
    },
    doublePlay () {
      var self = this
      self.playState = "暂停"
      if (self.speed == "×1") {
        self.speed = "×2"
        self.frequency = 1000
      } else {
        self.speed = "×1"
        self.frequency = 500
      }

      self.startPlay(self.frequency)
    },
    timeSelect () {
      var self = this

      if (this.startTime == "" || this.endTime == "" || this.startDate == "" || this.endDate == "") {
        return self.$message({
          type: "error",
          message: "时间选择不完整,请检查"
        })
      }
      if (JSON.stringify(this.startDate.toLocaleString().split(" ")[0]) > JSON.stringify(this.endDate.toLocaleString().split(" ")[0]) ||
        (JSON.stringify(this.startDate.toLocaleString().split(" ")[0]) == JSON.stringify(this.endDate.toLocaleString().split(" ")[0]) &&
        (this.startTime > this.endTime||JSON.stringify(this.startTime) == JSON.stringify(this.endTime)))) {
        return self.$message({
          type: "error",
          message: "时间范围选择错误"
        })
      }
      window.clearInterval(self.isStartPlay)
      self.initHistroy()
      self.createHistoryDate()
    },
    createHistoryDate: function () {
      var self = this
      var startTime = new Date(this.startDate.toDateString() + " " + this.startTime.toTimeString()).getTime()
      var endTime = new Date(this.endDate.toDateString()+ " " + this.endTime.toTimeString()).getTime()
      if (self.historyStatus) {
        return self.$message({
          type: "error",
          message: "数据正在处理"
        })
      }
      self.historyStatus = true

      Data.getHistoryDataFile(startTime, endTime)
        .then(function (result) {
          self.getHistoryDataFile(startTime, endTime,result)
          return Promise.resolve()
        })
      Data.getAllHistoryInfo(startTime, endTime)
        .then(function (result) {
          console.log(JSON.stringify(result.labelHistoryInfo))
          self.historyConfigInfos = result.labelHistoryInfo
          if(self.historyInfos !== undefined){
            self.isProgressBar = true
          }
        })
    },
    getHistoryDataFile: function (startTime, endTime,result) {
      var self = this
      if (result === "false") {
        self.$message({
          type: "error",
          message: "连接超时"
        })
        self.historyStatus = false
      } else {
        self.historyInfos = result
        self.allTime = self.getAllTime(startTime, endTime)
        if(self.historyConfigInfos !== undefined){
          self.isProgressBar = true
        }
        self.historyStatus = false
      }
    },
    getAllTime: function (startTime, endTime) {

      var index = parseInt(new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
      var minute = (index) / 60
      var second = "0." + String(minute).split(".")[1]
      return parseInt(minute) + ":" + String(parseFloat(second) * 60).split(".")[0]

    },
    initHistroy: function () {
      var self = this
      self.startIndex = 0
      self.playProgress = 0
      self.isProgressBar = false
      self.isTimeSelect = false
      self.historyDataInfo.labelData = []
      self.historyDataInfo.uwbStationData = []
      self.historyDataInfo.rtkStationData = []
      self.historyDataInfo.rotationAngle = []
      self.playTime = "0:0"
      self.playState = "播放"
      self.speed = "×2"
      self.frequency = 1000
      self.historyInfos = undefined
    },

    startPlay: function (frequency) {
      var self = this
      if (self.historyInfos === undefined) {
        self.playState = "播放"
        return self.$message({
          type: "error",
          message: "数据正在加载中..."
        })
      }
      if (self.historyInfos.length == 0) {
        return self.$message({
          type: "error",
          message: "该时间段数据为空"
        })
      }
      window.clearInterval(self.isStartPlay)
      self.isStartPlay = setInterval(function () {
        if (self.startIndex >= self.historyInfos.length) {
          return window.clearInterval(self.isStartPlay)
        }
        self.showData(self.startIndex)
        var index = parseInt(self.startIndex * 100 / self.historyInfos.length)
        if (index < parseInt(100/self.historyInfos.length*(self.historyInfos.length-1))) {
          if(index == 0){
            self.playProgress = parseInt(100/self.historyInfos.length)
          }else {
            self.playProgress = parseInt((self.startIndex + 1)* 100 / self.historyInfos.length)
          }
        } else {
          if (self.startIndex == self.historyInfos.length - 1) {
            self.playProgress = 100
          }
        }
        self.startIndex++
        self.hadPlayTime(self.startIndex)

      }, frequency)
    },
    hadPlayTime: function (index) {
      var self = this
      var minute = index / 60
      var second = "0." + String(minute).split(".")[1]
      self.playTime = parseInt(minute) + ":" + String(parseFloat(second) * 60).split(".")[0]
    },
    showData: function (index) {
      var self = this
      var currentDate = self.historyInfos[index]
      self.getHistoryTable(currentDate,self.historyConfigInfos)
      self.historyDataInfo.coordinate = {
        "stationInfo": {},
        "labelInfo": {}
      }
      self.historyDataInfo.coordinate = self.baseCoor(self.historyDataInfo.uwbStationData, self.historyDataInfo.coordinate)
      self.historyDataInfo.coordinate = self.baseCoor(self.historyDataInfo.rtkStationData, self.historyDataInfo.coordinate)
      if (currentDate.user_uwb !== undefined) {
        for (var i = 0; i < currentDate.user_uwb.length; i++) {
          self.historyDataInfo.labelData = self.updateLabel(self.historyDataInfo.labelData, currentDate.user_uwb[i], 500)
          self.historyDataInfo.coordinate = self.roverCoor(self.historyDataInfo.labelData, self.historyDataInfo.coordinate, currentDate.user_uwb[i], 500)
        }
      }
      if (currentDate.rtkres_roverpos !== undefined) {
        for (var i = 0; i < currentDate.rtkres_roverpos.length; i++) {
          self.historyDataInfo.labelData = self.updateLabel(self.historyDataInfo.labelData, currentDate.rtkres_roverpos[i], 1000)
          self.historyDataInfo.coordinate = self.roverCoor(self.historyDataInfo.labelData, self.historyDataInfo.coordinate, currentDate.rtkres_roverpos[i], 1000)
        }
      }
      if (currentDate.rtkres_attitude !== undefined) {
        for (var i = 0; i < currentDate.rtkres_attitude.length; i++) {
          var attitude = currentDate.rtkres_attitude[i]
          self.historyDataInfo.rotationAngle = self.updateRotationAngle(self.historyDataInfo.rotationAngle, attitude)
        }
      }
      if (currentDate.user_stat !== undefined) {
        for (var i = 0; i < currentDate.user_stat.length; i++) {
          self.historyDataInfo.labelData = self.updateLabel(self.historyDataInfo.labelData, currentDate.user_stat[i], 1)
        }
      }
      if(currentDate.status !== undefined){
        for (var i = 0;i< currentDate.status.length; i++){
          var status = currentDate.status[i]
          self.historyDataInfo.uwbStationData = self.setTableStatus(self.historyDataInfo.uwbStationData,status)
          self.historyDataInfo.rtkStationData = self.setTableStatus(self.historyDataInfo.rtkStationData,status)
          self.historyDataInfo.labelData = self.setTableStatus(self.historyDataInfo.labelData,status)
        }
      }

    },
    getRegion: function () {
      var self = this
      Data.getAreas()
        .then(function (result) {
          self.region = JSON.parse(JSON.stringify(result))
          return Promise.resolve()
        })
      Data.getEquipments()
        .then(function (result) {
          self.equipment = JSON.parse(JSON.stringify(result))
          return Promise.resolve()
        })
    },
    updateRotationAngle: function (info, data) {
      info.firstangle = Number(data.elevationAngle / 1000)
      info.secondangle = Number(data.rollingAngle / 1000)
      info.thirdangle = Number(data.courseAngle / 1000)
      return info
    },
    baseCoor: function (info, coor) {
      for (var i = 0; i < info.length; i++) {
        coor.stationInfo[info[i].nodeID] = [info[i].x, info[i].y, info[i].name]
      }
      return JSON.parse(JSON.stringify(coor))
    },
    roverCoor: function (info, coor, data, number) {
      for (var i = 0; i < info.length; i++) {
        if (Number(data.nodeID) === Number(info[i].nodeID)) {
          var x = Number(data.x / number)
          var y = Number(data.y / number)
          var update = new Date().getTime()
          if (update - info[i].update > 1500) {
            var overTime = update - info[i].update
            console.log(info[i].nodeID + " 时间超时 " + parseFloat(overTime / 1000) + "秒")
          }
          coor.labelInfo[info[i].nodeID] = [x, y, info[i].name, update, info[i].color]
        }
      }
      return JSON.parse(JSON.stringify(coor))
    },
    reduction: function (id) {
      this.reset = id + "-" + Math.random()
    },
    changeProgress: function () {
      this.clear = !this.clear
      this.startIndex = parseInt(this.playProgress * this.historyInfos.length / 100)
    },
    getHistoryTable: function (data,configInfo) {
      var self = this
      self.historyDataInfo.rtkStationData = []
      self.historyDataInfo.uwbStationData = []
      self.historyDataInfo.labelData = []
      var colors = ["Crimson", "Blue", "PaleVioletRed", "DarkCyan", "DarkMagenta", "Indigo", "Cyan", "DarkSlateGray","DoderBlue", "SeaGreen", "Lime", "Yellow", "Olive", "GoldEnrod", "SaddleBrown", "RosyBrown", "Black", "Silver"]
      for (var i=0;i<configInfo.length;i++){
        var config = configInfo[i]
        if(config.length == 0) return
        var diffTimeLittle = []
        var diffTimeBig = []
        var diffTime = null
        for (var j = 0; j<config.length;j++) {
          if(config[j].updateDate <= data.timestamp){
            diffTimeLittle.push(config[j])
          }else {
            diffTimeBig.push(config[j])
          }
        }
        if(diffTimeLittle.length !== 0){
          for(var k=0 ; k<diffTimeLittle.length;k++){
            if(diffTime == null){
              diffTime = diffTimeLittle[k]
            }else {
              diffTime = Math.abs(diffTime.updateDate - data.timestamp) > Math.abs(diffTimeLittle[k].updateDate - data.timestamp) ? diffTimeLittle[k]: diffTime
            }
          }
        }else {
          for(var k=0 ; k<diffTimeBig.length;k++){
            if(diffTime == null){
              diffTime = diffTimeBig[k]
            }else {
              diffTime = Math.abs(diffTime.updateDate - data.timestamp) > Math.abs(diffTimeBig[k].updateDate - data.timestamp) ? diffTimeBig[k]: diffTime
            }
          }
        }
        self.getConfigTable(diffTime,colors,data)
      }
    },
    getConfigTable: function (diffTime,colors,data) {
      var self = this
      if(diffTime !== null) {
        if (diffTime.updateDate <= data.timestamp) {
          if (diffTime.delete !== undefined) {
          } else {
            if (diffTime.afterUpdateInfo.nodeType == 1) {
              diffTime.afterUpdateInfo.coordinate = diffTime.afterUpdateInfo.x + "," + diffTime.afterUpdateInfo.y + "," + diffTime.afterUpdateInfo.z
              self.historyDataInfo.rtkStationData.push(diffTime.afterUpdateInfo)
            }
            if (diffTime.afterUpdateInfo.nodeType == 2) {
              diffTime.afterUpdateInfo.coordinate = diffTime.afterUpdateInfo.x + "," + diffTime.afterUpdateInfo.y + "," + diffTime.afterUpdateInfo.z
              self.historyDataInfo.uwbStationData.push(diffTime.afterUpdateInfo)
            }
            if (diffTime.afterUpdateInfo.nodeType == 3) {
              diffTime.afterUpdateInfo.color = colors.shift() || "#"+(Math.random()*0xffffff<<0).toString(16)
              self.historyDataInfo.labelData.push(diffTime.afterUpdateInfo)
            }
          }
        } else {
          if (diffTime.delete !== undefined) {
            // self.$notify.info({
            //   message: diffTime.id + "被删除",
            //   showClose: false,
            //   position: "bottom-right"
            // });
          } else {
            if (diffTime.beforeUpdateInfo !== null) {
              if (diffTime.beforeUpdateInfo.nodeType == 1) {
                diffTime.beforeUpdateInfo.coordinate = diffTime.beforeUpdateInfo.x + "," + diffTime.beforeUpdateInfo.y + "," + diffTime.beforeUpdateInfo.z
                self.historyDataInfo.rtkStationData.push(diffTime.beforeUpdateInfo)
              }
              if (diffTime.beforeUpdateInfo.nodeType == 2) {
                diffTime.beforeUpdateInfo.coordinate = diffTime.beforeUpdateInfo.x + "," + diffTime.beforeUpdateInfo.y + "," + diffTime.beforeUpdateInfo.z
                self.historyDataInfo.uwbStationData.push(diffTime.beforeUpdateInfo)
              }
              if (diffTime.beforeUpdateInfo.nodeType == 3) {
                diffTime.beforeUpdateInfo.color = colors.shift() || "#"+(Math.random()*0xffffff<<0).toString(16)
                self.historyDataInfo.labelData.push(diffTime.beforeUpdateInfo)
              }
            }
          }
        }
      }
    }
  }

}
