import Data from '../server/httpServer'
import Bus from '../bus'

export default {
  data () {
    var checknodeID = (rule, value, callback) => {
        if ((value % 1 === 0) == false) {
            return callback(new Error('请输入整数的节点ID'))
        }
        callback()
    }
    return {
      tableData: [],
      dialogAddStation: false,
      dialogEditStation: false,
      form: {},
      addForm: {},
      rules: {
        nodeID: [
	        {validator: checknodeID, trigger: 'blur'}
        ],
        name: [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        nodeType: [
          {required: true, type: 'number', message: '基站类型', trigger: 'change'}
        ],
        delaySend: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        is_moving: [
          {type: 'boolean', message: '请输入', trigger: 'blur'}
        ],
        x: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        y: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        z: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        channel: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        headLength: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        headCode: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ],
        PRF: [
          {type: 'number', message: '请输入', trigger: 'blur'}
        ]
      },
      formLabelWidth: '120px'
    }
  },
  created: function () {
    var self = this
    self.getStationInfo()

    Bus.$on('status',function (data) {
      self.tableData = self.setTableStatus(data)
    })
  },
  methods: {
    openEdit: function (data) {
      // Clone data to a new object
      this.form = Object.assign({}, data)
      this.dialogEditStation = true
    },
    getStationInfo: function () {
      var self = this
      Data.getStations()
        .then(function (stations) {
          self.tableData = self.showCoordinate(stations)
        })
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
      return JSON.parse(JSON.stringify(self.tableData))
    },
    showCoordinate: function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].coordinate = data[i].x + ',' + data[i].y + ',' + data[i].z
      }
      return data
    },
    addStation (formName) {
      var self = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          Data.addStation(self.addForm)
            .then(function () {
              self.getStationInfo()
              self.dialogAddStation = false
            },function (err) {
              if(err.body.indexOf('Insert failed, duplicate id') !== -1){
                self.$message({
                  type: 'error',
                  message: '添加失败,nodeID相同'
                })
              }
            })
        } else {
          self.$message({
            type: 'error',
            message: '表格验证失败'
          })
          return false
        }
      })
    },
    updateStation: function (formName) {
      var self = this
      this.$refs[formName].validate((valid) => {
        if (valid) {
          Data.updateStation(self.form.id, self.form)
            .then(function () {
              self.$message({
                type: 'success',
                message: '更新成功'
              })
              self.dialogEditStation = false
              self.getStationInfo()
            }, function () {
              self.$message({
                type: 'error',
                message: '更新失败'
              })
            })
        }else {
          self.$message({
            type: 'error',
            message: '表格验证失败'
          })
        }
      })

    },
    cancelInfo(formName){
        this.dialogEditStation = false;
        this.$refs[formName].resetFields();
    },
    cancelAdd(formName){
      this.dialogAddStation = false
      this.$refs[formName].resetFields();
    },
    deleteStation: function (index, rows) {
      var self = this
      return Promise.resolve()
        .then(function () {
          return self.$confirm('确定要删除此基站？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          })
        })
        .then(function () {
          // Say yes
          return Data.deleteStation(rows[index].id)
            .then(function () {
              return self.getStationInfo()
            })
            .then(function () {
              self.$message({
                type: 'success',
                message: '删除成功'
              })
            }, function () {
              self.$message({
                type: 'error',
                message: '删除失败'
              })
            })
        })
    },
    restartWrapper: function () {
      var self = this
      return Data.restartWrapper()
        .then(function () {
          self.$message({
            type: 'success',
            message: '重启成功'
          })
        }, function () {
          self.$message({
            type: 'error',
            message: '重启失败'
          })
        })
    },
    stopWrapper: function () {
      var self = this
      return Data.stopWrapper()
        .then(function () {
          self.$message({
            type: 'success',
            message: '服务停止'
          })
        },function () {
          self.$message({
            type: 'error',
            message: '停止失败'
          })
        })
    }
  }
}
