/**
 * Created by chenyu on 17/10/18.
 */
import Vue from 'vue'


export default {
  // Area
  addArea: function (form) {
    return Vue.http.post(window.url + '/areas', form)
  },
  getAreas: function () {
    return Vue.http.get(window.url + '/areas')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  deleteArea: function (id) {
    return Vue.http.delete(window.url + '/areas/' + id)
  },
  updateArea: function (id, form) {
    return Vue.http.put(window.url + '/areas/' + id, form)
  },

  //plane
  addEquipment: function (form) {
    return Vue.http.post(window.url + '/vehicle', form)
  },
  getEquipments: function () {
    return Vue.http.get(window.url + '/vehicle')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  deleteEquipment: function (id) {
    return Vue.http.delete(window.url + '/vehicle/' + id)
  },
  updateEquipment: function (id, form) {
    return Vue.http.put(window.url + '/vehicle/' + id, form)
  },

  // Station
  getStations: function () {
    return Vue.http.get(window.url + '/nodes?nodeType=1&nodeType=2')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  getUwbStations: function () {
    return Vue.http.get(window.url + '/nodes?nodeType=2')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  getGnssStations: function () {
    return Vue.http.get(window.url + '/nodes?nodeType=1')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  getLabels: function () {
    return Vue.http.get(window.url + '/nodes?nodeType=3')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  updateStation: function (id, form) {
    return Vue.http.put(window.url + '/nodes/' + id, form)
  },
  addStation: function (form) {
    return Vue.http.post(window.url + '/nodes', form)
  },
  deleteStation: function (id) {
    return Vue.http.delete(window.url + '/nodes/' + id)
  },
  restartWrapper: function () {
    return Vue.http.get(window.url + '/wrapper/restart')
  },
  stopWrapper: function () {
    return Vue.http.get(window.url + '/wrapper/stop')
  },
  //history
  getHistoryDataFile:function (startTime, endTime) {
    return Vue.http.get(window.url + '/getHistoryDataFile?startTime=' + new Date(startTime).getTime() + '&endTime=' + new Date(endTime).getTime())
      .then(function (res) {
        return  Promise.resolve(res.body)
      })
  },
  getAllHistoryInfo:function (startTime, endTime) {
      return Vue.http.get(window.url + '/getAllHistoryInfo?startTime=' + new Date(startTime).getTime() + '&endTime=' + new Date(endTime).getTime())
          .then(function (res) {
              return  Promise.resolve(res.body)
          })
  },

  getUser:function (username,password) {
    return Vue.http.post(window.url + '/login', {'username': username, 'password': password})
      .then(function (res) {
        return  Promise.resolve(res.body)
      })
  },
  isLogin:function () {
    return Vue.http.get(window.url + '/isLogin')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  getUWB: function () {
    return Vue.http.get(window.url + '/uwb')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  updateUWB: function (form) {
    return Vue.http.put(window.url + '/uwb', form)
  },
  getRTK: function () {
    return Vue.http.get(window.url + '/rtk')
      .then(function (res) {
        return Promise.resolve(res.body)
      })
  },
  updateRTK: function (form) {
    return Vue.http.put(window.url + '/rtk' ,form)
  }

}
