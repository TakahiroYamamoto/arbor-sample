(function($){

  var Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d");
    var gfx = arbor.Graphics(canvas);
    var particleSystem;

    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screenSize(canvas.width, canvas.height)
        particleSystem.screenPadding(80)
        that.initMouseHandling()
      },
      redraw:function(){
        ctx.fillStyle = "white"
        ctx.fillRect(0,0, canvas.width, canvas.height)

        particleSystem.eachEdge(function(edge, pt1, pt2){
          ctx.strokeStyle = "rgba(0,0,0, .333)"
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(pt1.x, pt1.y)
          ctx.lineTo(pt2.x, pt2.y)
          ctx.stroke()
        })

        var nodeBoxes = {}
        particleSystem.eachNode(function(node, pt){
          var label = node.name||""
          var w = ctx.measureText(""+label).width + 20
          if (!(""+label).match(/^[ \t]*$/)){
            pt.x = Math.floor(pt.x)
            pt.y = Math.floor(pt.y)
          }else{
            label = null
          }

          var img = new Image();
          if(node.name == "AM")
          {
            img.src = "resource/AM.png";
            ctx.drawImage(img, pt.x-w/2, pt.y-w/2, w,w);
          }
          else if(node.name == "CH")
          {
            img.src = "resource/CH.png";
            ctx.drawImage(img, pt.x-w/2, pt.y-w/2, w,w);
          }
          else if(node.name == "CN")
          {
            img.src = "resource/CN.png";
            ctx.drawImage(img, pt.x-w/2, pt.y-w/2, w,w);
          }
          else if(node.name == "EN")
          {
            img.src = "resource/EN.png";
            ctx.drawImage(img, pt.x-w/2, pt.y-w/2, w,w);
          }
          else if(node.name == "JP")
          {
            img.src = "resource/JP.png";
            ctx.drawImage(img, pt.x-w/2, pt.y-w/2, w,w);
          }
          else
          {
            ctx.fillStyle = "rgba(0,0,0,0.666)"
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
          }
          nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
        })
      },


      initMouseHandling:function(){
        var dragged = null;
        var handler = {
          clicked:function(e){
            var pos = $(canvas).offset();
            _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
            dragged = particleSystem.nearest(_mouseP);

            if (dragged && dragged.node !== null){
              dragged.node.fixed = true
            }

            $(canvas).bind('mousemove', handler.dragged)
            $(window).bind('mouseup', handler.dropped)

            return false
          },
          dragged:function(e){
            var pos = $(canvas).offset();
            var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null){
              var p = particleSystem.fromScreen(s)
              dragged.node.p = p
            }

            return false
          },

          dropped:function(e){
            if (dragged===null || dragged.node===undefined) return
            if (dragged.node !== null) dragged.node.fixed = false
            dragged.node.tempMass = 1000
            dragged = null
            $(canvas).unbind('mousemove', handler.dragged)
            $(window).unbind('mouseup', handler.dropped)
            _mouseP = null
            return false
          }
        }
        $(canvas).mousedown(handler.clicked);

      },

    }
    return that
  }

  $(document).ready(function(){
    var sys = arbor.ParticleSystem(1000, 60, 0.5)
    sys.parameters({gravity:true})
    sys.renderer = Renderer("#viewport")
    sys.addNode('AM');
    sys.addNode('CH');
    sys.addNode('JP');
    sys.addNode('CN');
    sys.addNode('EN');
    sys.addEdge('AM','CN');
    sys.addEdge('CN','JP');
    sys.addEdge('JP','CH');
    sys.addEdge('CH','EN');
    sys.addEdge('EN','AM');

  })

})(this.jQuery)
