import Vue from "vue";

var Bus = new Vue()

window.client.subscribe("/node", function (message) {
    Bus.$emit("message", message)
    if (message.name === "rtkres_basepos") {
    // console.log(message.data)
        message.data.x = message.data.lat
        message.data.y = message.data.lon
        Bus.$emit("rtkres_basepos", message.data);
    }
    if (message.name === "rtkres_baseobs") {
        Bus.$emit("rtkres_baseobs", message.data);
    }
    if (message.name === "status") {
        Bus.$emit("status", message.data);
    }
    if (message.name === "rtkres_roverpos") {
        message.data.x = (message.data.x/1000);
        message.data.y = (message.data.y/1000);
        message.data.z = (message.data.z/1000);
        Bus.$emit("rtkres_roverpos", message.data);
    }
    if (message.name === "rtkres_roverobs") {
        Bus.$emit("rtkres_roverobs", message.data);
    }
    if (message.name === "rtkres_attitude") {
        Bus.$emit("rtkres_attitude", message.data);
    }
    if (message.name === "uwbbase_stat") {
        Bus.$emit("uwbbase_stat", message.data);
    }
    if (message.name === "user_uwb") {
        message.data.x = (message.data.x / 500)
        message.data.y = (message.data.y / 500)
        message.data.z = ""
      // console.log("user_uwb",message.data)
        Bus.$emit("user_uwb", message.data);
    }
    if (message.name === "user_stat") {
        Bus.$emit("user_stat", message.data);
    }
})

export default Bus;
