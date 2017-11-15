/**
 * Created by chenyu on 17/10/18.
 */
import Data from "../server/httpServer" ;

export default {
  data () {
    var checkPoint = (rule, value, callback) => {
      if (value.length < 1) {
        return callback(new Error("坐标不能为空"))
      } else if (isNaN(value[0])) {
        return callback(new Error("必须为数字值"))
      } else if((value[1] !== undefined) && (isNaN(value[1]))) {
        return callback(new Error("必须为数字值"))
      }
      callback()
    }
    return {
      zoneData: [],
      dialogEditZone: false,
      dialogAddZone: false,

      form: {
        start_point: []
      },
      addForm: {
        start_point: []
      },
      formLabelWidth: "120px",
      rules: {
        region_name: [
          {required: true, message: "请输入名称", trigger: "blur"}
        ],
        width: [
          {required: true, type: "number", message: "请输入长度", trigger: "blur,change"}
        ],
        height: [
          {required: true, type: "number", message: "请输入宽度", trigger: "blur,change"}
        ],
        background_image: [
          {required: true, message: "请输入图片路径", trigger: "blur"}
        ],
        start_point: [
          {required: true, validator: checkPoint, trigger: "blur"}
        ],
        maxEnlarge: [
          {required: true, type: "number", message: "请输入最大放大倍数", trigger: "blur,change"}
        ],
        maxNarrow: [
          {required: true, type: "number", message: "请输入最大缩小倍数", trigger: "blur,change"}
        ]
      }
    }
  },
  mounted: function () {
    this.getZoneInfo()
  },
  methods: {
    openEdit: function (data) {
      // Clone data to a new object
      this.form = Object.assign({}, data)
      this.dialogEditZone = true
    },
    getZoneInfo: function () {
      var self = this
      return Data.getAreas()
        .then(function (result) {
          self.zoneData = self.showCoordinate(result)
          return Promise.resolve()
        })
    },
    deleteArea: function (index, rows) {
      var self = this
      return Promise.resolve()
        .then(function () {
          return self.$confirm("确定要删除此区域？", "警告", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          })
        })
        .then(function () {
          // Say yes
          return Data.deleteArea(rows[index].id)
            .then(function () {
              return self.getZoneInfo()
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
    },
    updateArea (formName) {
      var self = this
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.updateArea(self.form.id, self.form)
            .then(function () {
              self.$message({
                type: "success",
                message: "更新成功"
              })
              self.dialogEditZone = false
              self.getZoneInfo()
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
    addArea (formName) {
      var self = this
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.addArea(self.addForm)
            .then(function () {
              self.dialogAddZone = false
              self.getZoneInfo()
            }, function () {
              self.$message({
                type: "error",
                message: "添加失败"
              })
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
    cancelAdd (formName) {
      this.dialogAddZone = false
      this.$refs[formName].resetFields()
    },
    cancelInfo(formName){
      this.dialogEditZone = false;
      this.$refs[formName].resetFields();
    },
    showCoordinate: function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].coordinate = data[i].start_point[0] + "," + data[i].start_point[1]
      }
      return data
    },
  }
}
