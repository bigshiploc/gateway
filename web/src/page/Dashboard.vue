<template>
    <div id="app">
        <sidebar/>
        <el-row>
            <el-col :span="14" :offset=5 class="panel-title-button">
                <el-button-group>
                    <el-button :plain="true" @click="showRealTimeData">实时数据</el-button>
                    <el-button :plain="true" class="panelButtonLeft" @click="showHistoryData">历史数据</el-button>
                </el-button-group>
            </el-col>
        </el-row>

        <div v-show="isRealTimeData">
            <el-row class="row-bg">
                <el-col :span="18" :offset="5">
                    <el-card class="box-card">
                        <div>舰船情况</div>
                        <div class="euler-angle">
                            <p class="number">{{realDataInfo.rotationAngle.firstangle}}</p>
                            <span class="unit">俯仰</span>
                        </div>
                        <div class="euler-angle">
                            <p class="number">{{realDataInfo.rotationAngle.secondangle}}</p>
                            <span class="unit">横滚</span>
                        </div>
                        <div class="euler-angle">
                            <p class="number">{{realDataInfo.rotationAngle.thirdangle}}</p>
                            <span class="unit">偏航</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div v-if="region.length>0" v-for="(item,index) in region" style="margin-bottom: 20px">
                <el-row class="row-bg">
                    <el-col :span="18" :offset="5">
                        <el-card class="box-card">
                            <div class="father">
                                {{item.region_name}}
                                <el-button size="mini" @click="reduction(item.region_name)" icon="el-icon-refresh">重置
                                </el-button>
                            </div>
                            <div class="heightblock">
                                <div class="testblock">
                                    <controlMap :blockId="'d3_'+item.region_name" :coordinate="realDataInfo.coordinate"
                                                :windowWidth="windowWidth" :region="region"
                                                :regionName="item.region_name" :reset="reset"
                                                :equipment="equipment"
                                                class="first-region"></controlMap>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <el-row class="row-bg">
                <el-col :span="18" :offset="5">
                    <el-tabs v-model="activeNode">
                        <el-tab-pane label="终端节点" name="labelChange">
                            <nodeList url="label" :tableData="realDataInfo.labelData" class="table"></nodeList>
                        </el-tab-pane>
                        <el-tab-pane label="UWB基站节点" name="UWBstationChange">
                            <nodeList url="station" :tableData="realDataInfo.uwbStationData" class="table"></nodeList>
                        </el-tab-pane>
                        <el-tab-pane label="GNSS基站节点" name="RTKstationChange">
                            <nodeList url="station" :tableData="realDataInfo.rtkStationData" class="table"></nodeList>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>
        </div>
        <div v-show="!isRealTimeData">
            <el-row class="row-bg">
                <el-col :span="18" :offset="5">
                    <el-card class="box-card">
                        <div>舰船情况</div>
                        <div class="euler-angle">
                            <p class="number">{{historyDataInfo.rotationAngle.firstangle}}</p>
                            <span class="unit">俯仰</span>
                        </div>
                        <div class="euler-angle">
                            <p class="number">{{historyDataInfo.rotationAngle.secondangle}}</p>
                            <span class="unit">横滚</span>
                        </div>
                        <div class="euler-angle">
                            <p class="number">{{historyDataInfo.rotationAngle.thirdangle}}</p>
                            <span class="unit">偏航</span>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <div v-if="region.length>0" v-for="(item,index) in region" style="margin-bottom: 20px">
                <el-row class="row-bg">
                    <el-col :span="18" :offset="5">
                        <el-card class="box-card">
                            <div class="father">
                                {{item.region_name}}
                                <el-button size="mini" @click="reduction('history'+item.region_name)" icon="el-icon-refresh">重置
                                </el-button>
                            </div>
                            <div class="heightblock">
                                <div class="testblock">
                                    <controlMap :blockId="'history'+item.region_name"
                                                :coordinate="historyDataInfo.coordinate" :blockShow="blockShow"
                                                :windowWidth="windowWidth" :region="region"
                                                :regionName="item.region_name" :reset="reset" :clear="clear"
                                                :equipment="equipment"
                                                class="first-region"></controlMap>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <el-row class="row-bg">
                <el-col :span="18" :offset="5">
                    <el-tabs v-model="activeNode">
                        <el-tab-pane label="终端节点" name="labelChange">
                            <nodeList url="label" :tableData="historyDataInfo.labelData" class="table"></nodeList>
                        </el-tab-pane>
                        <el-tab-pane label="UWB基站节点" name="UWBstationChange">
                            <nodeList url="station" :tableData="historyDataInfo.uwbStationData" class="table"></nodeList>
                        </el-tab-pane>
                        <el-tab-pane label="GNSS基站节点" name="RTKstationChange">
                            <nodeList url="station" :tableData="historyDataInfo.rtkStationData" class="table"></nodeList>
                        </el-tab-pane>
                        <!--<el-tab-pane label="UWB基站同步" name="stationTogether"></el-tab-pane>-->
                    </el-tabs>
                </el-col>
            </el-row>
            <el-dialog title="历史数据查询" :visible.sync="isTimeSelect">
                <div class="block">
                    <span class="demonstration">起始时间</span>
                    <el-date-picker v-model="startDate" type="date" placeholder="选择日期"
                                    :picker-options="startDataSelect">
                    </el-date-picker>
                    <el-time-picker v-model="startTime" placeholder="任意时间点">
                    </el-time-picker>
                </div>
                <div class="block">
                    <span class="demonstration">截至时间</span>
                    <el-date-picker v-model="endDate" type="date" placeholder="选择日期" :picker-options="endDataSelect">
                    </el-date-picker>
                    <el-time-picker v-model="endTime" placeholder="任意时间点" :picker-options="{ minTime: startTime }">
                    </el-time-picker>
                </div>
                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="timeSelect">确 定</el-button>
                </div>
            </el-dialog>
            <el-row :span="18" class="progress-bar" v-show="isProgressBar">
                <el-col :span="1" :offset="5" class="star-time"><span>{{playTime}}</span></el-col>
                <el-col :span="13">
                    <el-slider v-model="playProgress" :step="1" @change="changeProgress()"></el-slider>
                </el-col>
                <el-col :span="1" class="sum-time"><span>{{allTime}}</span></el-col>
                <el-col :span="3">
                    <el-button type="primary" @click="play">{{playState}}</el-button>
                    <el-button @click="doublePlay" size="large">{{speed}}</el-button>
                </el-col>
                <el-col :span="1" class="play-cancle"><span @click="progressBarShow">×</span></el-col>
            </el-row>
        </div>

    </div>
</template>

<script src="../js/page/dashboard.js"></script>
<style src="../../static/css/dashboard.css"></style>
