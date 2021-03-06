import Data from "../server/httpServer";

export default {
  data (){
    var checkPoint = (rule, value, callback) => {
      if (Object.keys(value).length < 1) {
         return callback(new Error("不能为空"));
      } else if ((value.vLimit === "") || (value.hightLimit === "")) {
         return callback(new Error("不能为空"));
      } else if((value.vLimit === undefined) || (value.hightLimit === undefined)){
         return callback(new Error("不能为空"));
      }
      callback();
    }
    var checkNumber = (rule, value, callback) => {
      if (Object.keys(value).length < 1) {
        return callback(new Error("不能为空"))
      } else if ((value.C22 === undefined) || (value.C21 === undefined)) {
        return callback(new Error("请输入数字值"))
      } else if((value.C22 === "") || (value.C21 === "")) {
        return callback(new Error("请输入数字值"))
      }
      callback()
    }
    return{
      uwbData: [],
      rtkData: [],
      dialogEditUWB: false,
      dialogEditRTK: false,
      uwbForm: {limit:{},
        threshold:{}
        },
      rtkForm:{},
      formLabelWidth: "120px",
      rules:{
        limit:[
          {required: true,validator: checkPoint, trigger: "blur"}
        ],
        threshold:[
          {required: true,validator: checkNumber, trigger: "blur"}
        ],
        IterNum: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        positionMargin: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        positionNumToPick: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        portToUWBLib: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        logLevel: [
          {required: true, message: "请输入", trigger: "blur,change"}
        ],
        recorder: [
          {required: true, message: "请输入", trigger: "blur,change"}
        ],
        InputStream_type: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        InputStream_file: [
          {required: true,  message: "请输入", trigger: "blur,change"}
        ],
        Log_InputData: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        Log_OutputData: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ],
        Log_RoverSol: [
          {required: true, type: "number", message: "请输入数字值", trigger: "blur,change"}
        ]
      }
    }
  },
  created: function () {
    this.getUWBInfo()
    this.getRTKInfo()
  },
  methods: {
    getUWBInfo: function () {
      var self = this
      Data.getUWB()
        .then(function (result) {
          var info = []
          info.push((JSON.parse(JSON.stringify(result))))
          self.uwbData = info
          self.uwbForm = result
        })
    },
    getRTKInfo: function () {
      var self = this
      Data.getRTK()
        .then(function (result) {
          var info = []
          info.push((JSON.parse(JSON.stringify(result))))
          self.rtkData = info
          self.rtkForm = result
        })
    },
    updateUWB (formName) {
      var self = this
      // TODO add validator
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.updateUWB(self.uwbForm)
            .then(function () {
              self.$message({
                type: "success",
                message: "更新成功"
              })
              self.dialogEditUWB = false
              self.getUWBInfo()
            }, function (err) {
              self.$message({
                type: "error",
                message: "更新失败"
              })
            })
            .then(function () {

            })
        }else {
          self.$message({
            type: "error",
            message: "表格验证失败"
          })
          return false
        }
      })

    },
    updateRTK (formName) {
      var self = this
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.updateRTK(self.rtkForm)
            .then(function () {
              self.$message({
                type: "success",
                message: "更新成功"
              })
              self.dialogEditRTK = false
              self.getRTKInfo()
            }, function (err) {
              self.$message({
                type: "error",
                message: "更新失败"
              })
            })
            .then(function () {

            })
        }else {
          self.$message({
            type: "error",
            message: "表格验证失败"
          })
          return false
        }
      })

    },

    cancelInfo(formName){
      this.dialogEditUWB = false
      this.dialogEditRTK = false
      this.$refs[formName].resetFields()
    },
  }
}
