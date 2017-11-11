export default {
  props: {
    id: String,
    rotationAngle: Object
  },
  data: function () {
    return {}
  },
  watch: {
    rotationAngle: function () {
      this.start()
    }
  },
  mounted() {
    this.getPointer()
  },
  methods: {
    getPointer: function () {

      var self = this
      var elem = document.getElementById(this.id)
      this.two = new window.Two({width: 100, height: 100}).appendTo(elem)
      var middleground = this.two.makeGroup()
      this.sun = self.makeSun(this.two)
      this.sun.translation.set(this.two.width / 2, this.two.height / 2)
      middleground.add(this.sun)
      this.two.play()

    },
    start: function () {
      var  move = this.rotationAngle[this.id]
      var self = this;
      // move = 1
      this.two.bind('update', function (frameCount) {
        // if (self.sun.rotation >= move - 0.0625) {
        //   self.sun.rotation = 0
        // }
        // self.sun.rotation += (move - self.sun.rotation) * 0.0625
        self.sun.rotation =  Math.PI*1.5 + Number(move)  ;

      })
    },
    makeSun: function (two) {
      const self = this
      const color = 'rgba(55, 130, 246, 0.66)'
      const sun = two.makeGroup()
      const radius = 4
      const gutter = 50
      const core = two.makeCircle(0, 0, radius)
      core.noStroke()
      core.fill = color
      sun.core = core
      const coronas = []
      const amount = 1
      const pct = (amount + 1) / amount
      const theta = pct * Math.PI * 2
      const x = (radius + gutter) * Math.cos(theta)
      const y = (radius + gutter) * Math.sin(theta)
      const corona = self.makeTriangle(two, gutter)
      corona.noStroke()
      corona.fill = 'red'
      corona.translation.set(20, 0)
      corona.rotation = Math.atan2(-y, -x) + Math.PI / 2
      coronas.push(corona)
      sun.add(core).add(coronas)
      return sun
    },
    makeTriangle: function (two, size) {
      const tri = two.makePath(-size / 20, 0, size / 20, 0, 0, size)
      return tri
    }
  }
}
