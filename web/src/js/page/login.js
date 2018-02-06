import Data from "../server/httpServer" ;
export default {
  name: "signIn",
  data() {
    return {
      msg: "BIG SHIP管理后台",
      username: "",
      password: ""
    }
  },
  methods: {
    login: function (event) {
      var self = this
      return Data.getUser(this.username, this.password)
        .then(function (result) {
          if(result !== false){
            localStorage.setItem("user", JSON.stringify({"username": self.username, "password": self.password}))
            self.$router.push("/")
          }else {
            self.$message({
              type: "error",
              message: "用户名或密码错误"
            })
          }
        })
    }
  }
}
