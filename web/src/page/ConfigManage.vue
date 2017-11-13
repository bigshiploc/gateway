<template>
    <div id="app">
        <sidebar/>
        <el-row>
            <el-col :span="14" :offset=5 class="stationManageTitle">
                UWB配置管理
                <el-button type="text" icon="el-icon-edit" @click="dialogEditUWB = true" style="margin-left: 20px">
                    修改
                </el-button>
            </el-col>
        </el-row>

        <el-row>
            <el-col :span="18" :offset=5  style="margin-bottom: 20px">
                <el-table :data="uwbData" style="width: 100%">
                    <el-table-column label="limit">
                        <el-table-column
                                prop="limit.hightLimit"
                                label="hightLimit">
                        </el-table-column>
                        <el-table-column
                                prop="limit.vLimit"
                                label="vLimit">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column label="threshold">
                        <el-table-column
                                prop="threshold.C21"
                                label="C21">
                        </el-table-column>
                        <el-table-column
                                prop="threshold.C22"
                                label="C22">
                        </el-table-column>
                    </el-table-column>
                    <el-table-column
                            prop="IterNum"
                            label="IterNum">
                    </el-table-column>
                    <el-table-column
                            prop="positionMargin"
                            label="positionMargin">
                    </el-table-column>
                    <el-table-column
                            prop="positionNumToPick"
                            label="positionNumToPick">
                    </el-table-column>
                    <el-table-column
                            prop="portToUWBLib"
                            label="portToUWBLib">
                    </el-table-column>
                    <el-table-column
                            prop="logLevel"
                            label="logLevel">
                    </el-table-column>
                    <el-table-column
                            prop="recorder"
                            label="recorder">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="14" :offset=5 class="stationManageTitle">
                RTK配置管理
                <el-button type="text" icon="el-icon-edit" @click="dialogEditRTK = true" style="margin-left: 20px">
                    修改
                </el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="18" :offset=5  style="margin-bottom: 20px">
                <el-table :data="rtkData" style="width: 100%">
                    <el-table-column
                            prop="InputStream_type"
                            label="InputStream_type">
                    </el-table-column>
                    <el-table-column
                            prop="InputStream_file"
                            label="InputStream_file">
                    </el-table-column>
                    <el-table-column
                            prop="Log_InputData"
                            label="Log_InputData">
                    </el-table-column>
                    <el-table-column
                            prop="Log_OutputData"
                            label="Log_OutputData">
                    </el-table-column>
                    <el-table-column
                            prop="Log_RoverSol"
                            label="Log_RoverSol">
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <el-dialog title="修改" :visible.sync="dialogEditUWB" top="5%" :modal="true" :show-close="false">
            <el-form :model="uwbForm"  :rules="rules" ref="uwbForm"  labelPosition="left">
                <el-form-item label="hightLimit" prop="limit.hightLimit"  :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.limit.hightLimit" autoComplete="off" placeholder="hightLimit"></el-input>
                </el-form-item>
                <el-form-item label="vLimit" prop="limit.vLimit" :label-width="formLabelWidth">
                    <el-input v-model="uwbForm.limit.vLimit" autoComplete="off" placeholder="vLimit"></el-input>
                </el-form-item>
                <el-form-item label="C21" prop="threshold.C21" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.threshold.C21" autoComplete="off" placeholder="C21" ></el-input>
                </el-form-item>
                <el-form-item label="C22" prop="threshold.C22" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.threshold.C22" autoComplete="off" placeholder="C22" ></el-input>
                </el-form-item>
                <el-form-item label="IterNum" prop="IterNum" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.IterNum" autoComplete="off" placeholder="IterNum" ></el-input>
                </el-form-item>
                <el-form-item label="positionMargin" prop="positionMargin" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.positionMargin" autoComplete="off" placeholder="positionMargin" ></el-input>
                </el-form-item>
                <el-form-item label="positionNumToPick" prop="positionNumToPick" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.positionNumToPick" autoComplete="off" placeholder="positionMargin" ></el-input>
                </el-form-item>
                <el-form-item label="portToUWBLib" prop="portToUWBLib" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="uwbForm.portToUWBLib" autoComplete="off" placeholder="portToUWBLib" ></el-input>
                </el-form-item>
                <el-form-item label="logLevel" prop="logLevel" :label-width="formLabelWidth">
                    <el-input v-model="uwbForm.logLevel" autoComplete="off" placeholder="logLevel"></el-input>
                </el-form-item>
                <el-form-item label="recorder" prop="recorder" :label-width="formLabelWidth">
                    <el-input v-model="uwbForm.recorder" autoComplete="off" placeholder="recorder"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('uwbForm')">取消</el-button>
                <el-button type="primary" @click="updateUWB('uwbForm')">保存</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改" :visible.sync="dialogEditRTK" top="5%" :modal="true" :show-close="false">
            <el-form :model="rtkForm"  :rules="rules" ref="rtkForm"  labelPosition="left">
                <el-form-item label="InputStream_type" prop="InputStream_type"  :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="rtkForm.InputStream_type" autoComplete="off" placeholder="InputStream_type"></el-input>
                </el-form-item>
                <el-form-item label="InputStream_file" prop="InputStream_file" :label-width="formLabelWidth">
                    <el-input v-model="rtkForm.InputStream_file" autoComplete="off" placeholder="InputStream_file"></el-input>
                </el-form-item>
                <el-form-item label="Log_InputData" prop="Log_InputData" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="rtkForm.Log_InputData" autoComplete="off" placeholder="Log_InputData" ></el-input>
                </el-form-item>
                <el-form-item label="Log_OutputData" prop="Log_OutputData" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="rtkForm.Log_OutputData" autoComplete="off" placeholder="Log_OutputData" ></el-input>
                </el-form-item>
                <el-form-item label="Log_RoverSol" prop="Log_RoverSol" :label-width="formLabelWidth">
                    <el-input type="number" v-model.number="rtkForm.Log_RoverSol" autoComplete="off" placeholder="Log_RoverSol" ></el-input>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="cancelInfo('rtkForm')">取消</el-button>
                <el-button type="primary" @click="updateRTK('rtkForm')">保存</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script src="../js/page/configManage.js"></script>
