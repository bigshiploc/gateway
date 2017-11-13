<template>
    <div id="app">
        <sidebar/>
        <el-row>
            <el-col :offset=5 class="stationManageTitle">
                基站管理
                <el-button type="text" icon="el-icon-plus" @click="dialogAddStation = true" style="margin-left: 20px">
                    添加
                </el-button>
                <el-button type="text" icon="el-icon-refresh" @click="restartWrapper" style="margin-left: 20px">
                    重启服务
                </el-button>
                <el-button type="text" icon="el-icon-circle-close-outline" @click="stopWrapper" style="margin-left: 20px">
                    停止服务
                </el-button>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="18" :offset=5 class="stationManage" style="margin-bottom: 20px">
                <el-table :data="tableData" style="width: 100%">
                    <el-table-column prop="nodeID" :label="'节点ID'"></el-table-column>
                    <el-table-column prop="name" label="名称"></el-table-column>
                    <el-table-column prop="type" sortable label="类型">
                        <template slot-scope="scope">
                            <el-tag type="primary">{{ scope.row.nodeType == 2 ? 'UWB' : 'GNSS' }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="coordinate" label="坐标"></el-table-column>
                    <el-table-column prop="status" label="状态"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
                            <el-button size="small" type="text" class="stationManageRe"
                                       @click.native.prevent="deleteStation(scope.$index, tableData)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog title="编辑" :visible.sync="dialogEditStation" top="5%" :modal="true" :show-close="false">
            <el-form :model="form" :rules="rules" ref="form" labelPosition="left">
                <el-form-item label="节点ID" prop="nodeID":label-width="formLabelWidth">
                    <el-input type="number" :disabled="true"  v-model.number="form.nodeID" autoComplete="off" placeholder="节点ID"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
                    <el-input v-model="form.name" autoComplete="off" placeholder="节点名称"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="nodeType" :label-width="formLabelWidth">
                    <el-select v-model="form.nodeType" placeholder="类型">
                        <el-option label="GNSS" v-bind:value="1"></el-option>
                        <el-option label="UWB" v-bind:value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="form.nodeType == 2" label="delaySend" prop="delaySend" :label-width="formLabelWidth">
                    <el-input-number v-model="form.delaySend" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="x" prop="x" :label-width="formLabelWidth">
                    <el-input-number v-model="form.x" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="y" prop="y" :label-width="formLabelWidth">
                    <el-input-number v-model="form.y" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="z" prop="z" :label-width="formLabelWidth">
                    <el-input-number v-model="form.z" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="form.nodeType == 1" >
                    <el-switch
                            v-model="form.is_moving"
                            active-text="动态"
                            inactive-text="静态">
                    </el-switch>
                </el-form-item>
                <el-form-item  v-if="form.nodeType == 2" label="channel" prop="channel" :label-width="formLabelWidth">
                    <el-input-number v-model="form.channel" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="form.nodeType == 2" label="headLength" prop="headLength" :label-width="formLabelWidth">
                    <el-input-number v-model="form.headLength" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="form.nodeType == 2" label="headCode" prop="headCode" :label-width="formLabelWidth">
                    <el-input-number v-model="form.headCode" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="form.nodeType == 2" label="PRF" prop="PRF" :label-width="formLabelWidth">
                    <el-input-number v-model="form.PRF" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('form')">取 消</el-button>
                <el-button type="primary" @click="updateStation('form')">保存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="添加基站" :visible.sync="dialogAddStation" top="5%" :modal="true" :show-close="false">
            <el-form :model="addForm" :rules="rules" ref="addForm" labelPosition="left">
                <el-form-item label="节点ID" prop="nodeID" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.nodeID" autoComplete="off" placeholder="节点ID"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="name" :label-width="formLabelWidth">
                    <el-input v-model="addForm.name" autoComplete="off" placeholder="节点名称"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="nodeType" :label-width="formLabelWidth">
                    <el-select v-model="addForm.nodeType" placeholder="类型">
                        <el-option label="GNSS" v-bind:value="1"></el-option>
                        <el-option label="UWB" v-bind:value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="addForm.nodeType == 2" label="delaySend" prop="delaySend" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.delaySend" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="x" prop="x" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.x" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="y" prop="y" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.y" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item label="z" prop="z" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.z" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="addForm.nodeType == 1" >
                    <el-switch
                            v-model="addForm.is_moving"
                            active-text="动态"
                            inactive-text="静态">
                    </el-switch>
                </el-form-item>
                <el-form-item  v-if="addForm.nodeType == 2" label="channel" prop="channel" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.channel" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="addForm.nodeType == 2" label="headLength" prop="headLength" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.headLength" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="addForm.nodeType == 2" label="headCode" prop="headCode" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.headCode" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
                <el-form-item v-if="addForm.nodeType == 2" label="PRF" prop="PRF" :label-width="formLabelWidth">
                    <el-input-number v-model="addForm.PRF" autoComplete="off" placeholder="">
                    </el-input-number>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd('addForm')">取 消</el-button>
                <el-button type="primary" @click="addStation('addForm')">保存并写入</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script src="../js/page/stationManage.js"></script>
