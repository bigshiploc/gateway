<template>
  <div class="sidebar">
    <el-col :span="4" class="sidebarCol">
      <el-menu class="el-menu-vertical-demo sidebarMenu" :default-active="this.$route.path"  background-color="#545c64" text-color="#fff" :router="true" >
        <h3  class="sidebarTitle">BIG SHIP</h3>
          <el-menu-item index="/">
            <i class="el-icon-menu"></i>
            <span slot="title">监控面板</span>
          </el-menu-item>
          <el-menu-item index="/stationManage">
            <i class="el-icon-location"></i>
            <span slot="title">基站管理</span>
          </el-menu-item>
          <el-menu-item index="/labelManage">
            <i class="el-icon-location-outline"></i>
            <span slot="title">标签管理</span>
          </el-menu-item>
          <el-menu-item index="/zoneManage">
            <i class="el-icon-view"></i>
            <span slot="title">区域管理</span>
          </el-menu-item>
          <el-menu-item index="/planeManage">
            <i class="el-icon-view"></i>
            <span slot="title">飞机管理</span>
          </el-menu-item>
          <el-menu-item index="/configManage">
          <i class="el-icon-setting"></i>
          <span slot="title">配置管理</span>
          </el-menu-item>
      </el-menu>
    </el-col>
  </div>
</template>

<style src="@/components/sidebar/sidebar.css"></style>
