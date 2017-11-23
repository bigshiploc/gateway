
export default {
  props: {
    blockId: String,
    coordinate: Object,
    blockShow: Boolean,
    windowWidth: Number,
    region: Array,
    equipment: Array,
    regionName: String,
    reset: String,
    clear: Boolean
  },
  data: function () {
    return {
      size: 10,
      getProportion: 10,

      // startNodeID: "514",
      // endNodeID: "515",

      // planeWidth: 0.3,
      // planeHeight: 0.3,

      stationCoor :{},
      labelCoor: {},
      svgViewport: {},
      gX: {},
      gY: {},
      gridlinesX: {},
      gridlinesY: {},
      bkg: {},
      plane: {},
      planeInfo: [],

      stationIcon: {},

      circles: {},
      text: {},
      coorText: {},
      rect: {},
      innerSpace: {},

      labelsNodeID: [],
      stationsNodeID: [],

      allFrame: [],
      newx: null,
      newy: null,
      scale: null,
      startCoor: false,
      getTime: 0,
      dataArr: {},  //轨迹展示的所有终端的坐标集合。
      dataArrLen: 4,  //轨迹长度的全局变量（轨迹的点的个数）

      maxEnlarge: null,
      maxNarrow: null
    }
  },
  mounted: function(){
    this.getRange()
  },
  watch: {
    windowWidth: function(){
      this.onresize()
    },
    coordinate: function () {
      this.startMove()
      // this.getEquipment()
    },
    reset: function () {
      this.resetSize();
    },
    blockShow: function () {
      this.remove()
    },
    clear: function () {
      this.removeCircle()
    },
    equipment: function () {
      this.getEquipment()
    }
  },
  methods: {
    xAxisScale: function () {
      return d3.scaleLinear()
        .domain([this.startx, this.startx+this.rangeWidth])
        .range([0, this.svgWidth])
    },
    yAxisScale: function () {
      return d3.scaleLinear()
        .domain([this.starty, this.starty+this.rangeHeight])
        .range([this.svgHeight, 0])
    },
    xAxis: function () {
      return  d3.axisTop(this.xAxisScale())
    },
    yAxis: function () {
      return  d3.axisRight(this.yAxisScale())
    },
    getbkg: function (id, x, y, width, height, url) {
      return this.nodeLayer.append("svg:image")
        .attr("xlink:href", url)
        .attr("x", this.xAxisScale()(x))
        .attr("y", this.yAxisScale()(y))
        .attr("width", this.xAxisScale()(width) - this.xAxisScale()(0))
        .attr("height",this.yAxisScale()(0) - this.yAxisScale()(height))
    },
    getInnerSpace: function () {
      return this.svgViewport.append("g")
        .attr("class", "inner_space")
    },
    zoom: function () {
      return  d3.zoom()
        .on("zoom", this.zoomFunction)
        .scaleExtent([this.maxNarrow, this.maxEnlarge])
    },
    getNodeLayer:function () {
      var nodeLayer = this.innerSpace.append("g")
      return nodeLayer;
    },
    createStationIcon: function (nodeID, node_x, node_y,size,url) {
      var a = this.initCoordinate()[0];
      var b = this.initCoordinate()[1];
      var testX = this.newx? this.newx: this.xAxisScale();
      var testY = this.newy? this.newy: this.yAxisScale();
      var coor = this.nodeLayer.append("svg:image")
        .attr("class", nodeID)
        .attr("xlink:href", url)
        .attr("x", this.xAxisScale()(node_x)-size/2)
        .attr("y", this.yAxisScale()(node_y)-size/2)
        .attr("width", size/b)
        .attr("height",size/b)
        .attr("transform", a);
      if(url == "static/image/label.svg"){
        coor.attr("x", testX(node_x)-size/2)
          .attr("y", testY(node_y)-size/2)
          .attr("width", size)
          .attr("height",size)
      }
      coor.info ={x:node_x,y:node_y, offest_x:size/2, offest_y:size/2};
      return coor
    },
    createText: function (nodeID, node_x, node_y,name,color) {
      var a = this.initCoordinate()[0];
      var b = this.initCoordinate()[1];
      var coor = this.nodeLayer.append("text")
        .attr("id", nodeID)
        .attr("x", this.xAxisScale()(node_x)-this.size / b)
        .attr("y", this.yAxisScale()(node_y)+this.size*2 / b)
        .text(name)
        .attr("font-size",this.size / b)
        .attr("fill", color||"black")
        .attr("transform", a)
      coor.info ={x:node_x,y:node_y, offest_x:this.size, offest_y:this.size*2}
      return coor
    },
    createCoorText: function (nodeID, node_x, node_y,coor,color) {
      var a = this.initCoordinate()[0];
      var b = this.initCoordinate()[1];
      var coor =  this.nodeLayer.append("text")
        .attr("id", nodeID)
        .attr("x", this.xAxisScale()(node_x)-this.size / b)
        .attr("y", this.yAxisScale()(node_y)+this.size*3 / b)
        .text(coor)
        .attr("font-size",this.size / b)
        .attr("fill", color||"black")
        .attr("transform", a);
      coor.info ={x:node_x,y:node_y, offest_x:this.size, offest_y:this.size*3};
      return coor
    },
    createCircle:function (node_x,node_y,color) {
      var a = this.initCoordinate()[0];
      var b = this.initCoordinate()[1];
      return this.nodeLayer.append("circle") //需要添加nodeID，坐标x和y，颜色，缩放比例。
        .attr("r", 3/b)
        .attr("cx", node_x)
        .attr("cy", node_y)
        .attr("fill",color)
        .attr("transform", a)
    },
    initCoordinate: function () {
      var a  = this.bkg[this.region[0].region_name].attr("transform")
      var b;
      if(a != null){
        var c = a.split(/[(]|[)]/)
        b = parseFloat(c[c.length-2])
      }else {
        b = 1
      }
      var initData = [a,b];
      return initData;
    },
    getX: function () {
      var height = this.svgHeight-1;
      return this.innerSpace.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(this.xAxis())
    },
    getY: function () {
      return this.innerSpace.append("g")
        .attr("class", "axis axis--y")
        .call(this.yAxis())
    },
    getPlane: function () {
      return this.innerSpace.append("g")
    },
    make_x_gridlines: function () {
      return d3.axisBottom(this.xAxisScale())
    },
    make_y_gridlines: function () {
      return d3.axisLeft(this.yAxisScale())
    },
    get_x_gridlines: function () {
      return this.svgViewport.append("g")
        .attr("class", "grid")
        .style("stroke","#FF0000")
        .style("stroke-width","0.3px")
        .style("stroke-dasharray","5,5")
        .style("stroke-opacity","0.2")
        .style("stroke","dashed")
        .attr("transform", "translate(0," + this.svgHeight + ")")
        .call(this.make_x_gridlines()
          .tickSize(-this.svgHeight)
          .tickFormat("")
        )
    },
    get_y_gridlines: function () {
      return this.svgViewport.append("g")
        .attr("class", "grid")
        .style("stroke-width","0.3px")
        .style("stroke-dasharray","5,5")
        .style("stroke-opacity","0.2")
        .attr("fill","red !important")
        .call(this.make_y_gridlines()
          .tickSize(-this.svgWidth)
          .tickFormat("")
        )
    },
    createPlane: function (x,y,angle,width,heigth,id,url) {
      this.plane[id] = this.getPlane();
      var testX = this.newx? this.newx: this.xAxisScale();
      var testY = this.newy? this.newy: this.yAxisScale();
      var scale = this.scale? this.scale.k: 1;
      this.plane[id].append("svg:image")
        .attr("xlink:href", url)
        .attr("id",id)
        .attr("x", this.xAxisScale()(0)-this.xAxisScale()(width))
        .attr("y", this.xAxisScale()(0)-this.xAxisScale()(heigth))
        .attr("width",  this.xAxisScale()(width*2)-this.xAxisScale()(0))
        .attr("height", this.xAxisScale()(heigth*2)-this.xAxisScale()(0));
      this.plane[id].datum(function(d) {
        return {coor: [x, y], angle: angle};
      });
      this.plane[id].attr("transform", function(d, i) {
        return "translate(" + testX(d.coor[0])+","+testY(d.coor[1]) + ") rotate(" + d.angle + ") scale("+ scale+")";
      });
    },
    createCanvas: function () {
      this.svgViewport =  d3.select("#" + this.blockId)
        .append("svg")
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight)
        .style("background", "white")
        .call(this.zoom());

      this.innerSpace = this.getInnerSpace();

      this.nodeLayer = this.getNodeLayer();

      for(var i=0;i<this.region.length;i++){
        this.bkg[this.region[i].region_name] = this.getbkg(this.region[i].region_name, this.region[i].start_point[0], this.region[i].start_point[1]+this.region[i].height  , this.region[i].width, this.region[i].height, this.region[i].background_image)
      }


      this.gY = this.getY();
      this.gX = this.getX();
      this.gridlinesX = this.get_x_gridlines();
      this.gridlinesY = this.get_y_gridlines()
    },
    zoomFunction  () {
      var self = this;
      this.newx =  d3.event.transform.rescaleX(this.xAxisScale());
      this.newy =  d3.event.transform.rescaleY(this.yAxisScale());

      this.gX.call(this.xAxis().scale(this.newx));
      this.gY.call(this.yAxis().scale(this.newy));

      this.gridlinesX.call(
        d3.axisBottom(this.xAxisScale())
          .scale(this.newx)
          .tickSize(-this.svgHeight)
          .tickFormat("")
      );
      this.gridlinesY.call(
        d3.axisLeft(this.yAxisScale())
          .scale(this.newy)
          .tickSize(-this.svgWidth)
          .tickFormat("")
      );

      self.getProportion =self.size / d3.event.transform.k;
      self.scale = d3.event.transform;

      for (var i=0;i<this.region.length;i++){
        this.bkg[this.region[i].region_name].attr("transform",  self.scale)
      }

      for(var i=0; i<this.labelsNodeID.length; i++){
        var nodeId = this.labelsNodeID[i];
        var testX = self.newx? self.newx: self.xAxisScale();
        var testY = self.newy? self.newy: self.yAxisScale();

        this.stationIcon[nodeId].attr("transform",  self.scale)
          .attr("width", this.size*2)
          .attr("height", this.size*2)
          .attr("x", testX(self.stationIcon[nodeId].info.x)-self.stationIcon[nodeId].info.offest_x)
          .attr("y", testY(self.stationIcon[nodeId].info.y)-self.stationIcon[nodeId].info.offest_y)

        this.innerSpace.selectAll("circle").attr("transform", self.scale).attr("r",3/self.scale.k)
        this.zoomText(nodeId,self.scale)
      }
      for(var i=0; i<this.stationsNodeID.length; i++){
        var nodeId = this.stationsNodeID[i];

        this.stationIcon[this.stationsNodeID[i]].attr("transform",  self.scale)
          .attr("width", this.size*4 / self.scale.k)
          .attr("height", this.size*4 / self.scale.k)
          .attr("x", self.xAxisScale()(self.stationIcon[nodeId].info.x)-self.stationIcon[nodeId].info.offest_x/self.scale.k)
          .attr("y", self.yAxisScale()(self.stationIcon[nodeId].info.y)-self.stationIcon[nodeId].info.offest_y/self.scale.k);
        this.zoomText(nodeId,self.scale)
      }
      self.planeInfo.forEach(function (key) {
        if(self.plane[key.id]!== undefined){
          self.plane[key.id].attr("transform", function(d, i) {
            return "translate(" + self.newx(d.coor[0])+","+self.newy(d.coor[1]) + ") rotate(" + d.angle + ") scale("+ d3.event.transform.k+")";
          });
        }
      })
    },
    zoomText: function (nodeId,proportion) {
      var self = this;
      this.text[nodeId].attr("transform",  proportion)
        .attr("font-size", this.size / proportion.k)
        .attr("x", self.xAxisScale()(self.text[nodeId].info.x)-self.text[nodeId].info.offest_x/proportion.k)
        .attr("y", self.yAxisScale()(self.text[nodeId].info.y)+self.text[nodeId].info.offest_y/proportion.k);
      this.coorText[nodeId].attr("transform",  proportion)
        .attr("font-size", this.size / proportion.k)
        .attr("x", self.xAxisScale()(self.coorText[nodeId].info.x)-self.coorText[nodeId].info.offest_x/proportion.k)
        .attr("y", self.yAxisScale()(self.coorText[nodeId].info.y)+self.coorText[nodeId].info.offest_y/proportion.k)
    },

    startMove: function () {
      const self = this;
      if(self.startCoor === false) return;
      const  labelInfo = self.coordinate["labelInfo"] || {};
      const stationInfo = self.coordinate["stationInfo"] || {};

      self.getDeleteNode(self.labelsNodeID,labelInfo)
      self.getDeleteNode(self.stationsNodeID,stationInfo)

      Object.keys(labelInfo).forEach(function (key) {
        const node_x = labelInfo[key][0];
        const node_y = labelInfo[key][1];
        const name = labelInfo[key][2];
        const timeStamp = labelInfo[key][3];
        const color = labelInfo[key][4];
        const coor = "("+labelInfo[key][0]+","+labelInfo[key][1]+")";


        if(self.labelsNodeID.indexOf(key) !==-1){
          self.moveStationIcon(key,node_x,node_y,self.size/2,color)
          self.moveText(key,node_x,node_y,name,color)
          self.moveCoorText(key,node_x,node_y,coor,color)
          self.getDataArr(key,self.xAxisScale()(node_x),self.yAxisScale()(node_y), timeStamp, color)
          var nodeStatus = self.getLabelTime(key,timeStamp) //检查标签没有实时数据
          self.planeInfo.forEach(function (Plane) {
            if(self.plane[Plane.id] !== undefined){
              var startNodeID = Plane.node_ids[0]>Plane.node_ids[1] ? Plane.node_ids[1] : Plane.node_ids[0]
              var endNodeID = Plane.node_ids[0]>Plane.node_ids[1] ? Plane.node_ids[0] : Plane.node_ids[1]
              if((nodeStatus.nodeID == startNodeID || nodeStatus.nodeID == endNodeID) && nodeStatus.status == false ){
                self.plane[Plane.id].remove()
              }else if(labelInfo[startNodeID] == undefined || labelInfo[endNodeID] == undefined){
                self.plane[Plane.id].remove()
                self.plane[Plane.id] = undefined
              }else {
                var position = self.setPosition(labelInfo,startNodeID,endNodeID);
                if(Object.keys(position).length == 0) return;
                self.plane[Plane.id].datum(function(d) {
                  d.coor[0] = position.X;
                  d.coor[1] =  position.Y;
                  d.angle = position.angle;
                  return d
                });
                self.plane[Plane.id].attr("transform", function(d, i) {
                  var testX = self.newx? self.newx: self.xAxisScale();
                  var testY = self.newy? self.newy: self.yAxisScale();
                  var scale = self.scale? self.scale.k: 1;
                  return"translate(" + testX(d.coor[0])+","+testY(d.coor[1]) + ") rotate(" + d.angle + ") scale("+ scale+")";
                });
              }

            }
          })

        }else {

          self.stationIcon[key] = self.createStationIcon(key,node_x,node_y,self.size*2,"static/image/label.svg")
          self.text[key] = self.createText(key,node_x,node_y,name,color)
          self.coorText[key] = self.createCoorText(key,node_x,node_y,coor,color)
          self.dataArr[key] = []
          self.labelsNodeID.push(key)

          jQuery("image"+"."+key).each(function(){
            var $img = $(this);
            var imgClass = $img.attr("class");
            var imgURL = $img.attr("href");
            jQuery.get(imgURL, function(data) {
              var $svg = jQuery(data).find("svg");
              $svg.attr("x", $img.attr("x"));
              $svg.attr("y", $img.attr("y"));
              $svg.attr("width", $img.attr("width"));
              $svg.attr("height",$img.attr("height"));
              $svg.attr("fill", color);
              if(typeof imgClass !== "undefined") {
                $svg = $svg.attr("class", imgClass+" replaced-svg");
              }
              $svg = $svg.removeAttr("xmlns:a");

              $img.replaceWith($svg);

              $svg.info = self.stationIcon[key].info;
              self.stationIcon[key] = $svg
            }, "xml");
          });
          self.planeInfo.forEach(function (Plane) {
            var startNodeID = Plane.node_ids[0]>Plane.node_ids[1] ? Plane.node_ids[1] : Plane.node_ids[0]
            var endNodeID = Plane.node_ids[0]>Plane.node_ids[1] ? Plane.node_ids[0] : Plane.node_ids[1]
            var position = self.setPosition(labelInfo,startNodeID,endNodeID)
            if(Object.keys(position).length == 0) return;
            if(self.plane[Plane.id]!== undefined) return;
            self.createPlane(position.X,position.Y,position.angle,Plane.width,Plane.height,Plane.id,Plane.image)
          })
        }
      });
      Object.keys(stationInfo).forEach(function (key) {
        const node_x = stationInfo[key][0];
        const node_y = stationInfo[key][1];
        const name = stationInfo[key][2];
        const coor = "("+stationInfo[key][0]+","+stationInfo[key][1]+")";
        if(self.stationsNodeID.indexOf(key) !==-1){
          self.moveText(key,node_x,node_y,name)
          self.moveCoorText(key,node_x,node_y,coor)
          self.moveStationIcon(key,node_x,node_y,self.getProportion)

        }else {
          self.stationIcon[key] = self.createStationIcon(key,node_x,node_y,self.size*4,"static/image/station.svg");
          self.text[key] = self.createText(key,node_x,node_y,name);
          self.coorText[key] = self.createCoorText(key,node_x,node_y,coor);
          self.stationsNodeID.push(key)
        }
      })
    },

    moveText: function (key,node_x,node_y,name,color) {
      var self = this;
      self.text[key]
      // .transition()
        .attr("x", self.xAxisScale()(node_x)-self.getProportion)
        .attr("y", self.yAxisScale()(node_y)+self.getProportion*2)
        .text(name)
        .attr("fill", color||"black")
      self.text[key].info.x = node_x;
      self.text[key].info.y = node_y
    },

    moveCoorText: function (key,node_x,node_y,coor,color) {
      var self = this;
      self.coorText[key]
      // .transition()
        .attr("x", self.xAxisScale()(node_x)-self.getProportion)
        .attr("y", self.yAxisScale()(node_y)+self.getProportion*3)
        .text(coor)
        .attr("fill", color||"black")
      self.coorText[key].info.x = node_x;
      self.coorText[key].info.y = node_y
    },

    moveStationIcon: function (key,node_x,node_y,proportion,color) {
      var self = this;
      var testX = self.newx? self.newx: self.xAxisScale();
      var testY = self.newy? self.newy: self.yAxisScale();
      if(self.labelsNodeID.indexOf(key) !==-1){
        self.stationIcon[key]
          .attr("x", testX(node_x)- proportion*2)
          .attr("y", testY(node_y)- proportion*2)
          .attr("fill", color)
      }else {
        self.stationIcon[key]
          .attr("x", self.xAxisScale()(node_x)- proportion*2)
          .attr("y", self.yAxisScale()(node_y)- proportion*2);
      }


      self.stationIcon[key].info.x = node_x;
      self.stationIcon[key].info.y = node_y
    },

    setPosition: function (labelInfo,startNodeID,endNodeID) {
      var self = this;
      var position = {};

      if(labelInfo[startNodeID] === undefined ||labelInfo[endNodeID] === undefined) {
        return position
      }
      if(self.labelsNodeID.indexOf(startNodeID) !== -1 && self.labelsNodeID.indexOf(endNodeID) !== -1){
        position.X = (labelInfo[startNodeID][0] + labelInfo[endNodeID][0])/2;
        position.Y = (labelInfo[startNodeID][1] + labelInfo[endNodeID][1])/2;
        var x = Math.abs(labelInfo[endNodeID][0]-labelInfo[startNodeID][0]);
        var y = Math.abs(labelInfo[endNodeID][1]-labelInfo[startNodeID][1]);

        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        // this.planeWidth = z;
        // this.planeHeight = z;
        var sin = x/z;
        var radina = Math.asin(sin);//用反三角函数求弧度
        var angle = Math.floor(180/(Math.PI/radina));//将弧度转换成角度

        if(labelInfo[startNodeID][0]>labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]<labelInfo[endNodeID][1]){//鼠标在第四象限
          angle =  180-angle ;
        }
        if(labelInfo[startNodeID][0]<labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]>labelInfo[endNodeID][1]){//鼠标在第三象限
          angle = -angle;
        }
        if(labelInfo[startNodeID][0]<labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]<labelInfo[endNodeID][1]){//鼠标在第二象限
          angle = 180 + angle;
        }
        if(labelInfo[startNodeID][0]==labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]>labelInfo[endNodeID][1]){//鼠标在y轴负方向上
          angle = 0;
        }
        if(labelInfo[startNodeID][0]>labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]==labelInfo[endNodeID][1]){//鼠标在x轴正方向上
          angle = 90;
        }
        if(labelInfo[startNodeID][0]<labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]==labelInfo[endNodeID][1]){//鼠标在x轴负方向
          angle = 270;
        }
        if(labelInfo[startNodeID][0]==labelInfo[endNodeID][0]&&labelInfo[startNodeID][1]<labelInfo[endNodeID][1]){//鼠标在x轴负方向
          angle = 180;
        }
        position.angle = angle
      }
      return position
    },

    getDataArr: function(key,node_x,node_y,timeStamp,color) {
      var self = this
      if(self.dataArr[key].length < 1){
        var c = {x:node_x,y:node_y,time:timeStamp};
        self.dataArr[key].push(c)
        self.circles[key] = []
        self.circles[key].push(self.createCircle(node_x,node_y,color))
      }
      if(self.dataArr[key].length >= 1 && self.dataArr[key][self.dataArr[key].length-1].time != timeStamp){
        if(self.dataArr[key].length<self.dataArrLen){
          var a = {x:node_x,y:node_y,time:timeStamp};
          self.dataArr[key].push(a)
          self.circles[key].push(self.createCircle(node_x,node_y,color))
        }else {
          self.dataArr[key].shift();
          var b = {x:node_x,y:node_y,time:timeStamp};
          self.dataArr[key].push(b);

          for(var i = 0; i<self.dataArr[key].length; i++ ){
            self.circles[key][i]
              .attr("cx",(self.dataArr[key][i].x))
              .attr("cy",self.dataArr[key][i].y)
              .attr("fill",color)
          }

        }
      }

    },

    getLabelTime: function (key,timeStamp) {
      var update = new Date().getTime()
      if((update -timeStamp)>20000){
        return {"nodeID": key, "status": false}
      }else {
        return {"nodeID": key, "status": true}
      }

    },

    getEquipment: function () {
      var self = this
      self.equipment.forEach(function (key) {
        if(key.equipment_name == "飞机"){
          self.planeInfo.push(key)
        }
      })
    },
    getRange: function () {
      var self = this;
      for (var i = 0; i < self.region.length; i++) {
        if (self.region[i].region_name === self.regionName) {
          var info = self.region[i]
          self.startx = info.start_point[0]
          self.starty = info.start_point[1]
          self.svgWidth = document.getElementsByClassName("father")[0].offsetWidth;
          self.svgHeight = self.svgWidth * (info.height / info.width)
          self.rangeWidth = info.width
          self.rangeHeight = info.height
          self.maxEnlarge = info.maxEnlarge || 5
          self.maxNarrow = info.maxNarrow || 0.3
          self.onresize()
          self.createCanvas()
          self.startCoor = true
        }
      }
    },

    onresize: function () {

      var width = this.svgWidth;
      var height = this.svgHeight;
      var index = -1;
      var elem = document.getElementsByClassName("testblock");
      var heightblock = document.getElementsByClassName("heightblock");
      var father = document.getElementsByClassName("father");
      var canvasWidth;
      var hight;
      for(var i =0; i<elem.length;i++){
        if(elem[i].getElementsByTagName("div")[0].getAttribute("id") == this.blockId){
          index = i;
          break
        }
      }
      if (index == -1){
        return
      }
      for (var i = 0; i < father.length; i++) {
        if (father[i].offsetWidth != 0) {
          canvasWidth = father[i].offsetWidth
        }
      }
      var scale = Number((canvasWidth / width));
      elem[index].style.height = canvasWidth * (height / width) + "px";
      elem[index].style.transform = "scale(" + scale + "," + scale + ")";
      elem[index].style.transformOrigin = "0 0";
      hight = elem[index].style.height;
      heightblock[index].style.height = hight
    },

    resetSize: function () {
      if(this.reset == "") return;
      if(this.blockId === (this.reset.split("-")[0])){
        var reduction = d3.zoomIdentity.translate(0,0).scale(1);
        this.svgViewport.call(this.zoom().transform,reduction)
      }
    },
    remove: function () {
      var self = this
      var reduction = d3.zoomIdentity.translate(0,0).scale(1);
      self.svgViewport.call(self.zoom().transform,reduction)

      self.innerSpace.selectAll("circle").remove()
      for(var i=0; i<self.labelsNodeID.length; i++){
        var nodeID = self.labelsNodeID[i]
        self.stationIcon[nodeID].remove()
        self.text[nodeID].remove()
        self.coorText[nodeID].remove()
      }
      for(var i=0; i<self.stationsNodeID.length; i++){
        var nodeID = self.stationsNodeID[i]
        self.stationIcon[nodeID].remove()
        self.text[nodeID].remove()
        self.coorText[nodeID].remove()
      }
      self.labelsNodeID = []
      self.stationsNodeID = []
      self.dataArr = {}
      self.planeInfo.forEach(function (key) {
        if(self.plane[key.id]!== undefined){
          self.plane[key.id].remove()
        }
      })
      self.plane = {}

    },
    removeCircle: function () {
      this.innerSpace.selectAll("circle").remove()
      for (var i = 0; i < this.labelsNodeID.length; i++) {
        var nodeID = this.labelsNodeID[i]
        this.dataArr[nodeID] = []
      }
    },
    getDeleteNode: function (nodeIDs,info) {
      var self = this
      for(var i=0;i<nodeIDs.length;i++){
        var key = nodeIDs[i]
        if(info[key] === undefined){
          self.stationIcon[key].remove()
          self.text[key].remove()
          self.coorText[key].remove()
          if(self.dataArr[key] !== undefined){
            for(i in self.dataArr[key]){
              self.circles[key][i].remove()
              self.dataArr[key] = []
            }
          }
          nodeIDs.splice(nodeIDs.indexOf(key),1)
        }
      }
    }
  }
}
