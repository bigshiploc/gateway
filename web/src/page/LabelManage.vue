<template>
    <div>
        <sidebar/>
        <el-row>
            <el-col :span="14" :offset=5 class="stationManageTitle">
                标签管理
                <el-button type="text" icon="el-icon-plus" @click="dialogAddLabel = true" style="margin-left: 20px">添加
                </el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="18" :offset=5 class="stationManage">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="nodeID" :label="'节点ID'"></el-table-column>
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="status" label="电量">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.status < 30 ? 'danger' : 'success'">
                                {{scope.row.status}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="coordinate" label="坐标"></el-table-column>
                    <el-table-column prop="anchors" label="相关基站"></el-table-column>
                    <el-table-column prop="satNum" label="卫星数">
                        <template slot-scope="scope">
                            <el-tag :type="scope.row.satNum < 9 ? 'danger' : 'success'" >
                                {{scope.row.satNum}}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" label="状态"></el-table-column>
                    <el-table-column label="操作" >
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
                            <el-button size="small" type="text" class="stationManageRe"
                                       @click.native.prevent="deleteLabel(scope.$index, tableData)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog title="编辑" :visible.sync="dialogEditLabel" top="5%" :modal="true" :show-close="false">
            <el-form :model="form" labelPosition="left" :rules="rules" ref="form">
                <el-form-item label="节点ID" prop="nodeID" :label-width="formLabelWidth">
                    <el-input type="number" :disabled="true"  v-model.number="form.nodeID" autoComplete="off" placeholder="节点ID"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
                    <el-input v-model="form.name" autoComplete="off" placeholder="节点名称"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('form')">取 消</el-button>
                <el-button type="primary" @click="updateLabel('form')">保存并写入</el-button>
            </div>
        </el-dialog>


        <el-dialog title="添加标签" :visible.sync="dialogAddLabel" top="5%" :modal="true" :show-close="false">
            <el-form :model="addForm" labelPosition="left" :rules="rules" ref="addForm">
                <el-form-item label="节点ID" prop="nodeID" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.nodeID" autoComplete="off" placeholder="节点ID"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
                    <el-input v-model="addForm.name" autoComplete="off" placeholder="节点名称"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd('addForm')">取 消</el-button>
                <el-button type="primary" @click="addLabel('addForm')">保存并写入</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script src="../js/page/labelManage.js"></script>
