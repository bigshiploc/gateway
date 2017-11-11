import Data from '../server/httpServer'

export default {
  data() {
    return {
      equipmentData: [],
      allLabels: [],
      dialogEditEquipment: false,
      dialogAddEquipment: false,

      form: {
        node_ids: []
      },
      addForm: {
        node_ids: []
      },
      formLabelWidth: '120px',

      rules: {
        equipment_name: [
          {required: true, message: '请输入名称', trigger: 'blur'}
        ],
        width: [
          {required: true, type: 'number', message: '请输入长度', trigger: 'blur,change'}
        ],
        height: [
          {required: true, type: 'number', message: '请输入宽度', trigger: 'blur,change'}
        ],
        image: [
          {required: true, message: '请输入图片路径', trigger: 'blur'}
        ],
        style: [
          {required: true, message: '请选择类型', trigger: 'blur,change'}
        ]
      }
    }
  },
  mounted: function () {
    this.getEquipmentInfo()
    this.getLabels()
  },
  methods: {
    openEdit: function (data) {
      this.form = Object.assign({}, data)
      this.dialogEditEquipment = true
    },
    getEquipmentInfo: function () {
      var self = this
      return Data.getEquipments()
        .then(function (result) {
          self.equipmentData = result
          return Promise.resolve()
        })
    },
    addEquipment (formName) {
      var self = this
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.addEquipment(self.addForm)
            .then(function () {
              self.dialogAddEquipment = false
              self.getEquipmentInfo()
            }, function () {
              self.$message({
                type: 'error',
                message: '添加失败'
              })
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
    updateEquipment (formName) {
      var self = this
      // TODO add validator
      this.$refs[formName].validate(function (valid) {
        if (valid) {
          Data.updateEquipment(self.form.id, self.form)
            .then(function () {
              self.$message({
                type: 'success',
                message: '更新成功'
              })
              self.dialogEditEquipment = false
              self.getEquipmentInfo()
            }, function (err) {
              self.$message({
                type: 'error',
                message: '更新失败'
              })
            })
            .then(function () {

            })
        }else {
          self.$message({
            type: 'error',
            message: '表格验证失败'
          })
          return false
        }
      })

    },
    deleteEquipment: function (index, rows) {
      var self = this
      return Promise.resolve()
        .then(function () {
          return self.$confirm('确定要删除此设备？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
          })
        })
        .then(function () {
          // Say yes
          return Data.deleteEquipment(rows[index].id)
            .then(function () {
              return self.getEquipmentInfo()
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
    cancelAdd (formName) {
      this.dialogAddEquipment = false
      this.$refs[formName].resetFields()
    },
    cancelInfo(formName){
      this.dialogEditEquipment = false;
      this.$refs[formName].resetFields();
    },
    getLabels: function () {
      var self = this
      Data.getLabels()
        .then(function (result) {
          result.forEach(function (key) {
            self.allLabels.push(key.nodeID)
          })
        })

    }
  }
}