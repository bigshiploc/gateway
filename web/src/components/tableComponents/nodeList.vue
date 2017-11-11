<template>
    <div class="stationManage">
        <el-table :data="tableData" style="width: 100%">

            <el-table-column :label="'节点编号'">
                <template scope="scope">
                    <div style="display: inline-block; width: 10px;height: 10px" :style="{background: scope.row.color } "></div>
                    <span>{{scope.row.nodeID}}</span>
                </template>
            </el-table-column>
            <el-table-column prop="name" label="名称"></el-table-column>
            <el-table-column v-if="url == 'station'" prop="type" label="类型">
                             <!--:filters="filterType"-->
                             <!--:filter-method="filterByType" filter-placement="bottom-end">-->

                <template scope="scope">
                    <!--<el-tag :type="scope.row.nodeType=== 1 ? 'primary' : 'danger'">-->
                        {{scope.row.nodeType == 2 ?'UWB':'GNSS' }}
                    <!--</el-tag>-->
                </template>
            </el-table-column>
            <el-table-column v-if="url == 'label'"  prop="status" label="电量">
                             <!--:filters="[{ text: '正常', value: '正常' }, { text: '低电', value: '低电' }]"-->
                             <!--:filter-method="filterByStatus" filter-placement="bottom-end">-->
                <template scope="scope">
                    <el-tag :type="scope.row.status < 30 ? 'danger' : 'success'">
                        {{scope.row.status}}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column prop="coordinate" label="坐标"></el-table-column>
            <el-table-column v-if="url == 'label'" prop="anchors" label="相关基站"></el-table-column>
            <el-table-column v-if="url == 'label'" prop="satNum" label="卫星数">
                <template scope="scope">
                    <el-tag :type="scope.row.satNum < 9 ? 'danger' : 'success'" >
                        {{scope.row.satNum}}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态"></el-table-column>
        </el-table>
    </div>
</template>
<script src="@/components/tableComponents/nodeListController.js"></script>