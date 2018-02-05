var child_process = require ("child_process");

function install() {
  child_process.exec("cp db.json test.json",{maxBuffer: 1024 * 500000000},function (err) {
    if(err){
      console.log("复制失败");
    }else {
      console.log("开始升级，请耐心等待...")
      child_process.exec("git pull", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
        if(err){
          console.log("更新代码失败");
        }else {
          child_process.exec("cp test.json db.json" , {maxBuffer: 1024 * 500000000},function (err) {
            child_process.exec("rm node_modules -r", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {

              child_process.exec("npm install ", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
                if (err) {
                  console.log("安装失败，正在尝试重新安装...")
                  install();
                } else {
                  child_process.exec("cd web", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
                    if (err) {
                      console.log("失败");
                    } else {
                      child_process.exec("cd web && rm node_modules -r ", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
                        child_process.exec("cd web && npm install", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
                          if (err) {
                            console.log("web依赖安装失败，尝试重新安装")
                            install();
                          } else {
                            child_process.exec(" cd web && npm run build", {maxBuffer: 1024 * 500000000}, function (err, stdout, stderr) {
                              if (err) {
                                console.log("build失败");
                              } else {
                                console.log("升级成功");
                              }
                            });
                          }
                        });
                      });
                    }
                  });
                }
              });

            });
          });
        }
      });
    }
  });
}

install()
