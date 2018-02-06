<template>
  <div class="signIn">
    <h3 class="typeface-title">{{ msg }}</h3>

    <div class="SignInInput">
      <el-input placeholder="用户名" v-model="username" size="large" >
      </el-input>
    </div>

    <div class="SignInInput ">
      <el-input placeholder="密码" type="password" v-model="password" size="large">
      </el-input>
    </div>

    <div class="SignInInput">
      <el-button type="primary" @click="login" class="SignInButton" size="large">登录</el-button>
    </div>
  </div>
</template>

<script src="../js/page/login.js"></script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style src="../../static/css/login.css"></style>
