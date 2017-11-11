<template>
    <div>
        <sidebar/>
        <el-row>
            <el-col :offset=5 class="stationManageTitle">
                设备管理
                <el-button type="text" icon="el-icon-plus" @click="dialogAddEquipment = true" style="margin-left: 20px">添加
                </el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="18" :offset=5 class="stationManage" style="margin-bottom: 20px">
                <el-table :data="equipmentData" style="width: 100%">
                    <el-table-column prop="equipment_name" label="名称"></el-table-column>
                    <el-table-column prop="width" label="长"></el-table-column>
                    <el-table-column prop="height" label="宽"></el-table-column>
                    <el-table-column prop="image" label="图片url"></el-table-column>
                    <el-table-column prop="node_ids" label="设备构成">
                        <template scope="scope">
                            {{ scope.row.node_ids.join() }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="style" label="设备结构">
                    </el-table-column>
                    <el-table-column label="操作">
                        <template scope="scope">
                            <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
                            <el-button size="small" type="text" class="stationManageRe"
                                       @click.native.prevent="deleteEquipment(scope.$index, equipmentData)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog title="编辑" :visible.sync="dialogEditEquipment" top="5%" :modal="true" :show-close="false">
            <el-form :model="form" :rules="rules" ref="form" labelPosition="left">
                <el-form-item label="ID" :label-width="formLabelWidth">
                    <el-input v-model="form.id" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="equipment_name" :label-width="formLabelWidth">
                    <!--<el-input v-model="form.equipment_name" autoComplete="off" placeholder="名称"></el-input>-->
                    <el-select v-model="form.equipment_name" placeholder="类型">
                        <el-option label="飞机" v-bind:value="'飞机'"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="长" prop="width" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.width" autoComplete="off" placeholder="长" value="form.width"></el-input>
                </el-form-item>
                <el-form-item label="宽" prop="height" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.height" autoComplete="off" placeholder="宽" value="form.height"></el-input>
                </el-form-item>
                <el-form-item label="图片" prop="image" :label-width="formLabelWidth">
                    <el-input v-model="form.image" autoComplete="off" placeholder="url"
                              value="form.image"></el-input>
                </el-form-item>
                <el-form-item label="设备构成":label-width="formLabelWidth">
                    <el-checkbox-group v-model="form.node_ids">
                        <el-checkbox v-for="label in allLabels" :label="label" :key="label">{{label}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="设备结构" prop="style" :label-width="formLabelWidth">
                    <el-select v-model="form.style" placeholder="类型">
                        <el-option label="2-littlehead" v-bind:value="'2-littlehead'"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('form')">取消</el-button>
                <el-button type="primary" @click="updateEquipment('form')">保存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="添加设备" :visible.sync="dialogAddEquipment" top="5%" :modal="true" :show-close="false">
            <el-form :model="addForm"  :rules="rules" ref="addForm" labelPosition="left">
                <el-form-item label="名称" prop="equipment_name" :label-width="formLabelWidth">
                    <!--<el-input v-model="addForm.equipment_name" autoComplete="off" placeholder="名称"></el-input>-->
                    <el-select v-model="addForm.equipment_name" placeholder="名称">
                        <el-option label="飞机" v-bind:value="'飞机'"></el-option>
                    </el-select>

                </el-form-item>
                <el-form-item label="长" prop="width" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.width" autoComplete="off" placeholder="长"></el-input>
                </el-form-item>
                <el-form-item label="宽" prop="height" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.height" autoComplete="off" placeholder="宽"></el-input>
                </el-form-item>
                <el-form-item label="图片" prop="image" :label-width="formLabelWidth">
                    <el-input v-model="addForm.image" autoComplete="off" placeholder="url"></el-input>
                </el-form-item>
                <el-form-item label="设备构成" :label-width="formLabelWidth">
                    <el-checkbox-group v-model="addForm.node_ids">
                        <el-checkbox v-for="label in allLabels" :label="label" :key="label">{{label}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="设备结构" prop="style" :label-width="formLabelWidth">
                    <el-select v-model="addForm.style" placeholder="类型">
                        <el-option label="2-littlehead" v-bind:value="'2-littlehead'"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd('addForm')">取消</el-button>
                <el-button type="primary" @click="addEquipment('addForm')">创建</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script src="../js/page/planeManage.js"></script>