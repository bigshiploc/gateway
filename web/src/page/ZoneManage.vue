<template>
    <div>
        <sidebar/>
        <el-row>
            <el-col :offset=5 class="stationManageTitle">
                区域管理
                <el-button type="text" icon="el-icon-plus" @click="dialogAddZone = true" style="margin-left: 20px">添加
                </el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="18" :offset=5 class="stationManage" style="margin-bottom: 20px">
                <el-table :data="zoneData" style="width: 100%">
                    <el-table-column prop="region_name" label="名称"></el-table-column>
                    <el-table-column prop="width" label="长"></el-table-column>
                    <el-table-column prop="height" label="宽"></el-table-column>
                    <el-table-column prop="background_image" label="图片URL"></el-table-column>
                    <el-table-column prop="coordinate" label="坐标">
                        <!--<template scope="scope">-->
                            <!--{{scope.row.start_point.join()}}-->
                        <!--</template>-->
                    </el-table-column>
                    <el-table-column prop="maxEnlarge" label="最大放大倍数"></el-table-column>
                    <el-table-column prop="maxNarrow" label="最大缩小倍数"></el-table-column>
                    <el-table-column label="操作">
                        <template scope="scope">
                            <el-button type="text" size="small" @click="openEdit(scope.row)">编辑</el-button>
                            <el-button size="small" type="text" class="stationManageRe"
                                       @click.native.prevent="deleteArea(scope.$index, zoneData)">删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog title="编辑" :visible.sync="dialogEditZone" top="5%" :modal="true" :show-close="false">
            <el-form :model="form"  :rules="rules" ref="form"  labelPosition="left">
                <el-form-item label="ID" :label-width="formLabelWidth">
                    <el-input v-model="form.id" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="名称" prop="region_name" :label-width="formLabelWidth">
                    <el-input v-model="form.region_name" autoComplete="off" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item label="长" prop="width" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.width" autoComplete="off" placeholder="长" value="form.width"></el-input>
                </el-form-item>
                <el-form-item label="宽" prop="height" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.height" autoComplete="off" placeholder="宽" value="form.height"></el-input>
                </el-form-item>
                <el-form-item label="图片" prop="background_image" :label-width="formLabelWidth">
                    <el-input v-model="form.background_image" autoComplete="off" placeholder="url"
                              value="form.background_image"></el-input>
                </el-form-item>
                <el-form-item label="坐标" prop="start_point" :label-width="formLabelWidth">
                    <el-col :span="12">
                        <el-input type="number" v-model.number="form.start_point[0]" autoComplete="off" placeholder="X"
                                  value="form.start_point[0]"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-input type="number" v-model.number="form.start_point[1]" autoComplete="off" placeholder="Y"
                                  value="form.start_point[1]"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="最大放大倍数" prop="maxEnlarge" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.maxEnlarge" autoComplete="off" placeholder="最大放大倍数" value="form.maxEnlarge"></el-input>
                </el-form-item>
                <el-form-item label="最大缩小倍数" prop="maxNarrow" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="form.maxNarrow" autoComplete="off" placeholder="最大缩小倍数" value="form.maxNarrow"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('form')">取消</el-button>
                <el-button type="primary" @click="updateArea('form')">保存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="添加区域" :visible.sync="dialogAddZone" top="5%" :modal="true" :show-close="false">
            <el-form :model="addForm" :rules="rules" ref="addForm" labelPosition="left">
                <el-form-item label="名称" prop="region_name" :label-width="formLabelWidth">
                    <el-input v-model="addForm.region_name" autoComplete="off" placeholder="名称"></el-input>
                </el-form-item>
                <el-form-item label="长" prop="width" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.width" autoComplete="off" placeholder="长"></el-input>
                </el-form-item>
                <el-form-item label="宽" prop="height" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.height" autoComplete="off" placeholder="宽"></el-input>
                </el-form-item>
                <el-form-item label="图片" prop="background_image" :label-width="formLabelWidth">
                    <el-input v-model="addForm.background_image" autoComplete="off" placeholder="图片"></el-input>
                </el-form-item>
                <el-form-item label="坐标" prop="start_point" :label-width="formLabelWidth">
                    <el-col :span="12">
                        <el-input type="number" v-model.number="addForm.start_point[0]" prop="start_point" autoComplete="off"
                                  placeholder="X"></el-input>
                    </el-col>
                    <el-col :span="12">
                        <el-input type="number" v-model.number="addForm.start_point[1]" prop="start_point" autoComplete="off"
                                  placeholder="Y"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="最大放大倍数" prop="maxEnlarge" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.maxEnlarge" autoComplete="off" placeholder="最大放大倍数"></el-input>
                </el-form-item>
                <el-form-item label="最大缩小倍数" prop="maxNarrow" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="addForm.maxNarrow" autoComplete="off" placeholder="最大缩小倍数"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd('addForm')">取消</el-button>
                <el-button type="primary" @click="addArea('addForm')">创建</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script src="../js/page/zoneManage.js"></script>
