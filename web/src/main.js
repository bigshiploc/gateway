// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import VueResource from "vue-resource";
import hookForm from "vue-hook-form";
import App from "./App";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "lib-flexible/flexible.js";
import "../static/css/fontSize.css"
import sidebar from "@/components/sidebar/Sidebar";
import Data from "./js/server/httpServer";


router.beforeEach((to, from, next) => {
  if(to.path === '/login')  {
    next()
  } else {
  return Data.isLogin()
    .then(function (result) {
      if(result.bool == false){
        return next({ path: '/login' })
      }
      next()
    })
}
})

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueResource)
Vue.use(hookForm)
Vue.component("sidebar", sidebar)

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  template: "<App/>",
  components: {App}
})
