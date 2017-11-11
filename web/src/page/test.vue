<template>
  <el-table
          :data="tableData"
          style="width: 100%">
    <el-table-column
            prop="type"
            label="类型"
            width="180">
    </el-table-column>
    <el-table-column
            prop="value"
            label="值"
            width="900">
    </el-table-column>
  </el-table>
</template>

<script>
  import Bus from '../js/bus'
  export default {
    data () {
      return {
        tableData: []
      }
    },
    mounted: function () {
      var self = this
      self.tableData = [{type: '',
        value: ''}]
      Bus.$on('message', function (data) {
        var status = false
        for (var i = 0; i < self.tableData.length; i++) {
          if (self.tableData[i].type === data.name) {
            status = true
            self.tableData[i].value = JSON.stringify(data.data)
          }
        }
        if (status === false) {
          self.tableData.push({'type': data.name, 'value': data.data})
        }
      })
      console.log(window.d3)
    }

  }
</script>

<!--<template>-->
<!--<div>-->
<!--<div v-if="region.length>0" v-for="(item,index) in region" style="margin-bottom: 20px">-->
<!--<el-row class="row-bg">-->
<!--<el-col :span="18" :offset="5">-->
<!--<el-card class="box-card">-->
<!--<div class="father">监控区域{{index+1}}</div>-->
<!--<div class="heightblock">-->
<!--<div class="testblock">-->
<!--<controlMap  :blockId="item.region_name" :coordinate="realDataInfo.coordinate" :region="region" :regionName="item.region_name"></controlMap>-->
<!--</div>-->
<!--</div>-->
<!--</el-card>-->
<!--</el-col>-->
<!--</el-row>-->
<!--</div>-->
<!--</div>-->
<!--</template>-->

<!--<script>-->
<!--import controlMap from '@/components/blockMoveComponents/BlockMoveComponents.vue'-->
<!--import dashboardData from '../js/server/dashboardServer'-->
<!--import Data from '../js/server/httpServer'-->
<!--export default {-->
<!--data () {-->
<!--return {-->
<!--realDataInfo: {rotationAngle: {}, coordinate: {}, rtkStationData: [], labelData: [], uwbStationData: []},-->
<!--region: [],-->
<!--test: false-->
<!--}-->
<!--},-->
<!--components: {-->
<!--controlMap: controlMap-->
<!--},-->
<!--mounted: function () {-->
<!--var self = this-->
<!--dashboardData.setRealPos(function (result) {-->
<!--self.realDataInfo.coordinate = JSON.parse(JSON.stringify(result))-->
<!--})-->
<!--Data.getAllArea(function (result) {-->
<!--self.region = JSON.parse(JSON.stringify(result))-->
<!--})-->
<!--setTimeout(function () {-->
<!--self.test  = !self.test-->
<!--})-->
<!--}-->
<!--}-->
<!--</script>-->