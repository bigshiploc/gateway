import Data from "../server/httpServer"
import Bus from "../bus"

export default {
  data() {
    var checknodeID = (rule, value, callback) => {
	    if ((value % 1 === 0) == false) {
          return callback(new Error("请输入整数的节点ID"))
        }
        callback()
    }
    return {
      tableData: [],
      dialogAddLabel: false,
      dialogEditLabel: false,
      // colors : ["Crimson", "Blue", "PaleVioletRed", "DarkCyan", "DarkMagenta", "Indigo", "Cyan", "DarkSlateGray","DoderBlue", "SeaGreen", "Lime", "Yellow", "Olive", "GoldEnrod", "SaddleBrown", "RosyBrown", "Black", "Silver"],
      form: {
        nodeType: 3
      },
      addForm: {
        nodeType: 3
      },
      formLabelWidth: "120px",
      rules: {
        nodeID: [
          {required: true, validator: checknodeID, trigger: "blur"}
        ],
        name: [
          {required: true, message: "请输入名称", trigger: "blur"}
        ]
      }
    }
  },
  created: function () {
    var self = this
    self.getLabelInfo()
    Bus.$on("rtkres_roverpos", function (data) {
      self.tableData = self.updateLabelStatus(data)
    })
    Bus.$on("user_uwb", function (data) {
      self.tableData = self.updateLabelStatus(data)
    })
    Bus.$on("user_stat", function (data) {
      self.tableData = self.updateLabelStatus(data)
    })
    Bus.$on("status",function (data) {
      self.tableData = self.setTableStatus(data)
    })
  },
  methods: {
    openEdit: function (data) {
      // Clone data to a new object
      this.form = Object.assign({}, data)
      this.dialogEditLabel = true
    },
    getLabelInfo: function () {
      var self = this
      Data.getLabels()
        .then(function (result) {
          self.tableData = result
        })
    },
    updateLabelStatus: function(data){
      var self = this
      for (var i = 0; i < self.tableData.length; i++) {
        if (Number(data.nodeID) === Number(self.tableData[i].nodeID)) {
          if (data.battery !== undefined) {
            self.tableData[i].status = data.battery
          }
          if (data.x !== undefined) {
            if (data.z !== "") {
              if (data.stat != 0) {
                self.tableData[i].coordinate = data.x + "," + data.y + "," + data.z
              }
            } else {
              self.tableData[i].coordinate = data.x + "," + data.y
            }
          }
          if (data.anchors !== undefined) {
            self.tableData[i].anchors = data.anchors.join()
          }
          if ((data.satNum !== undefined)) {
            if (data.stat != 0) {
              self.tableData[i].satNum = data.satNum
            }

          }
        }
      }
      return JSON.parse(JSON.stringify(self.tableData))
    },
    setTableStatus: function (data) {
      var self = this
      for(var i=0;i<self.tableData.length; i++){
        for (var j=0;j<data.rtk.bases.length;j++){
          if(self.tableData[i].nodeID == data.rtk.bases[j].nodeID){
            self.tableData[i].status = data.rtk.bases[j].stat
          }
        }
        for(var k=0;k<data.uwb.bases.length;k++){
          if(self.tableData[i].nodeID == data.uwb.bases[k].nodeID){
            self.tableData[i].status = data.uwb.bases[k].stat
          }
        }
      }
      return self.tableData
    },
    updateLabel(formName) {
      var self = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          Data.updateStation(self.form.id, self.form)
            .then(function () {
              self.$message({
                type: "success",
                message: "更新成功"
              })
              self.dialogEditLabel = false
              self.getLabelInfo()
            }, function () {
              self.$message({
                type: "error",
                message: "更新失败"
              })
            })
        }else {
          self.$message({
            type: "error",
            message: "表格验证失败"
          })
        }
      })

    },
    addLabel(formName) {
      var self = this
      // var color =   "#"+(Math.random()*0xffffff<<0).toString(16)
      // self.addForm.color = self.colors.shift()
      this.$refs[formName].validate((valid) => {
        if (valid) {
          Data.addStation(self.addForm)
            .then(function () {
              self.dialogAddLabel = false
              self.getLabelInfo()
            },function (err) {
              if(err.body.indexOf("Insert failed, duplicate id") !== -1){
                self.$message({
                  type: "error",
                  message: "添加失败,nodeID相同"
                })
              }
            })
        } else {
          self.$message({
            type: "error",
            message: "表格验证失败"
          })
          return false
        }
      })
    },
    cancelInfo(formName){
        this.dialogEditLabel = false;
        this.$refs[formName].resetFields();
    },
    cancelAdd(formName){
      this.dialogAddLabel = false
      this.$refs[formName].resetFields();
    },
    deleteLabel: function (index, rows) {
      var self = this
      return Promise.resolve()
        .then(function () {
          return self.$confirm("确定要删除此标签？", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          })
        })
        .then(function () {
          // Say yes
          return Data.deleteStation(rows[index].id)
            .then(function () {
              return self.getLabelInfo()
            })
            .then(function () {
              self.$message({
                type: "success",
                message: "删除成功"
              })
            }, function () {
              self.$message({
                type: "error",
                message: "删除失败"
              })
            })
        })
    }
  }
}
