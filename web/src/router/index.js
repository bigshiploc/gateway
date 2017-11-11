import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/page/Login'
import Dashboard from '@/page/Dashboard'
import StationManage from '@/page/StationManage'
import LabelManage from '@/page/LabelManage'
import Test from '@/page/test'
import PlaneManage from '@/page/PlaneManage'
import ZoneManage from '@/page/ZoneManage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/stationManage',
      name: 'stationManage',
      component: StationManage
    },
    {
      path: '/labelManage',
      name: 'labelManage',
      component: LabelManage
    },
    {
      path: '/zoneManage',
      name: 'zoneManage',
      component: ZoneManage
    },
    {
      path: '/login',
      name: 'signIn',
      component: Login
    },
    {
      path: '/test',
      name: 'test',
      component: Test
    },
    {
      path: '/planeManage',
      name: 'plane',
      component: PlaneManage
    }
  ]
})
