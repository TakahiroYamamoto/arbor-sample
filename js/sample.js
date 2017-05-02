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
        if (!particleSystem) return

        gfx.clear()

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
          var label = node.data.v1||""
          var w = ctx.measureText(""+label).width + 10
          if (!(""+label).match(/^[ \t]*$/)){
            pt.x = Math.floor(pt.x)
            pt.y = Math.floor(pt.y)
          }else{
            label = null
          }

          if(node.data.who == "root")
          {
            ctx.fillStyle = "rgba(150,5,10,0.666)"
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle})
          }
          else if(node.data.who == "notPrime")
          {
            ctx.fillStyle = "rgba(0,20,150,0.666)"
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle})
          }
          else if(node.data.who == "notPrime2")
          {
            ctx.fillStyle = "rgba(10,150,40,0.666)"
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
          }
          else
          {
            ctx.fillStyle = "rgba(0,0,0,0.666)"
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
          }

          nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]

          // draw the text
          if (label){
            ctx.font = "12px Helvetica"
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            if (node.data.color=='none') ctx.fillStyle = '#333333'
            ctx.fillText(label||"", pt.x, pt.y+4)
            ctx.fillText(label||"", pt.x, pt.y+4)
          }
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

  var fact = [];
  $(document).ready(function(){
    sys = arbor.ParticleSystem(1000, 60, 0.5)
    sys.parameters({gravity:true})
    sys.renderer = Renderer("#viewport")
  })

  function factoring(seed,parent)
  {
    for(var i = Math.floor(seed/2) ; 1 < i ; i--)
    {
      if(seed % i == 0)
      {
        console.log(i);
        fact.push({'parent':parent,'seed':seed,'value':i});
        factoring(i,seed);
      }
    }
  }

  $('input[type="text"]').change(function() {

    //入力したvalue値を変数に格納
    var seed = Number($(this).val());
    fact.push({'parent':seed,'seed':seed,'value':seed});
    factoring(seed,seed);
    for(var i = 0 ; i < fact.length; i ++)
    {
      var f = fact[i];
      if(f.value == seed)
      {
        sys.addNode(f.seed+":"+f.value,{who:'root',v1:f.value});
      }
      else if(f.seed == seed)
      {
        sys.addNode(f.seed+":"+f.value,{who:'notPrime',v1:f.value});
      }
      else if(f.parent == seed)
      {
        sys.addNode(f.seed+":"+f.value,{who:'notPrime2',v1:f.value});
      }
      else
      {
        sys.addNode(f.seed+":"+f.value,{who:'',v1:f.value});
      }
    }
    for(var i = 0 ; i < fact.length; i ++)
    {
      var f = fact[i];
      if(f.value == seed)
      {
        continue;//一番根っこはEdgeを持たない
      }
      sys.addEdge(f.parent+":"+f.seed,f.seed+":"+f.value);
    }

  });

})(this.jQuery)
