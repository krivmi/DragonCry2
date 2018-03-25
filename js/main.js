/*
*   DragnCry2
*   main.js
*   author: Milan Křivánek
*   2018
*/

window.DragonCry = DragonCry || {};
var DragonCry = {
  render: {
    width: 960,
    height: 540
  },
  canvas: {
    canvas: document.getElementsByClassName('game-canvas')[0],
    context: document.getElementsByClassName('game-canvas')[0].getContext('2d'),
    setupCanvas: function () {
      var canvas = DragonCry.canvas.canvas;
      canvas.width = DragonCry.render.width;
      canvas.height = DragonCry.render.height;
      return canvas;
    },
    getDragonImage: function () {
      var img = new Image();
      img.src = "./img/Drak_gif3.png";
      return img;
    },
    clear() {
      var canvas = DragonCry.canvas.canvas;
      var context = DragonCry.canvas.context;
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height,
      );
    }
   
  },
  components: {
    obstacles: {
      cycle: 0,
      renderCycle: 0,
      min_period: 70,
      max_period: 100,
      minHeight: 20,
      maxHeight: 200,
      array: [],
      add() {
        that = DragonCry.components.obstacles;
        that.array.push(DragonCry.components.getSprite(that.options));
        
      },
      move(index) {
        that = DragonCry.components.obstacles;
        that.array[index].dx -= 2;
        
      },
      update() {
        that.cycle ++;
        if (that.cycle >= that.renderCycle) {
          that.cycle = 0;
          that.renderCycle = (Math.random() * that.min_period) + that.max_period;
          that.options.dy = Math.floor((Math.random() * 300) + 0);
          that.options.height = Math.floor((Math.random() * 440) + 50);
          if(that.options.height + that.options.dy > 440)
              console.log("Moc velké");
              that.options.height = Math.floor((Math.random() * 300) + 100);
          
                
          that.add();
        }
        for (var i = 0; i < that.array.length; i++) {
          that.move(i);
          if (that.array[i].dx + that.array[i].width <= 0) {
            that.array.splice(i, 1);
          }
        }
      },
      render() {
        that = DragonCry.components.obstacles;
        for (var i = 0; i < that.array.length; i ++) {
          that.array[i].render();
        }
      },
      init(options) {
        that = DragonCry.components.obstacles;
        options.context = DragonCry.canvas.context;
        options.isObstacle = true;
         that.options = options;
        
      
        
      }
    },
    Score: {
       score:0,
       updateScore() {
           var thatSc = DragonCry.components.Score;
           thatSc.score++;
       },
       renderScore() {
           var thatSc = DragonCry.components.Score;
           DragonCry.canvas.context.fillText("Score: "+ thatSc.score, 800, 60);
           DragonCry.canvas.context.font = "25px Arial";
           DragonCry.canvas.context.fillStyle = "#0095DD";
       },
       
    },
    getSprite: function (options) {
      return new DragonCry.components.sprite(options);
    },
    sprite: function (initial) {
      this.context = initial.context;
      this.frameIndex = 0;
      this.tickCount = 0;
      this.TPF = initial.TPF;
      this.NOF = initial.NOF || 1;

      this.width = initial.width;
      this.height = initial.height;
      this.sx = initial.sx;
      this.sy = initial.sy;
      this.dx = initial.dx;
      this.dy = initial.dy;
      this.dwidth = initial.dwidth;
      this.dheight = initial.dheight;
      this.image = initial.image;
      this.loop = initial.loop || true;
      this.isObstacle = initial.isObstacle || false;
      this.isScore = initial.isScore || false;
      this.minHeight=initial.minHeight;
      this.maxHeight=initial.maxHeight;

      this.move = function () {
        if (DragonCry.events.keys.up) {
          this.dy -= 3;
        }
        else if (DragonCry.events.keys.down) {
          this.dy += 3;
        }
        if (DragonCry.events.keys.left) {
          this.dx -= 1;
        }
        else if (DragonCry.events.keys.right) {
          this.dx += 2;
        }
      },
      this.crashWith = function(otherobj) {
        var myleft = this.dx + 20;
        var myright = this.dx + (this.dwidth) - 10; 
        var mytop = this.dy + 20;
        var mybottom = this.dy + (this.dheight) -20;
        var otherleft = otherobj.dx;
        var otherright = otherobj.dx + (otherobj.width);
        var othertop = otherobj.dy;
        var otherbottom = otherobj.dy + (otherobj.height);
        var crash = true;
       if ((mybottom < othertop) ||
               (mytop > otherbottom) ||
               (myright < otherleft) ||
               (myleft > otherright)) {
           crash = false;
        }
        return crash;
        
       
    },
      this.update = function () {
          if(DragonCry.game.dragon.dy < -30    ||
             DragonCry.game.dragon.dy >465   ||
             DragonCry.game.dragon.dx < -30     ||
             DragonCry.game.dragon.dx >860 )
            {
                DragonCry.game.stop();
                        }
          for (var i = 0; i < DragonCry.components.obstacles.array.length; i++) {
                
           if(DragonCry.game.dragon.crashWith(DragonCry.components.obstacles.array[i])) {
                    DragonCry.game.stop();
                }  
            }
      
 
       
        this.move();
        this.tickCount += 1;
        if (this.tickCount > this.TPF) {
          this.tickCount = 0;
          if (this.frameIndex < this.NOF - 1) {
            this.frameIndex += 1;
          } else if (this.loop) {
            this.frameIndex = 0;
          }
        }
        
      
     
  },
      this.render = function () {
        if (this.image) {
          this.context.drawImage(
              this.image,
              this.frameIndex * this.width / this.NOF,
              0,
              this.width / this.NOF,
              this.height,
              this.dx,
              this.dy,
              this.dwidth ,
              this.dheight,
          );
        } else {
          this.context.fillRect(
            this.dx,
            this.dy,
            this.width / this.NOF,
            this.height,
          );
        }
      }
    }
  },
  game: {
    dragon: undefined,
    obstacles: undefined,
    ended: false,
    options: {
      dragon: {
        width: 1007,
        height: 100,
        dx: 30,
        dy: 240,
        dwidth: 105,
        dheight: 100,
        NOF: 10,
        TPF: 3,
      },
      obstacle: {
        width: 20,
        height: 200,
        dx: 960,
        dy: 0,
        NOF: 1,
        TPF: 1,
      }
    },
    initDragon() {
      var dragonOptions = DragonCry.game.options.dragon;
      dragonOptions.context = DragonCry.canvas.context;
      dragonOptions.image = DragonCry.canvas.getDragonImage();
      DragonCry.game.dragon = DragonCry.components.getSprite(dragonOptions);
    },
    gameLoop() {
      window.requestAnimationFrame(DragonCry.game.gameLoop);
      DragonCry.canvas.clear();
      DragonCry.components.obstacles.update();
      DragonCry.components.obstacles.render();
      DragonCry.game.dragon.update();
      DragonCry.game.dragon.render();
      DragonCry.components.Score.updateScore();
      DragonCry.components.Score.renderScore();
      
    },
    startGame() {
      DragonCry.canvas.setupCanvas();
      DragonCry.game.initDragon();
      DragonCry.components.obstacles.init(DragonCry.game.options.obstacle);
      DragonCry.events.registerEvents();
      DragonCry.game.gameLoop();
    },
    stop(){ 
        alert("Game over \nVaše skore je: " + DragonCry.components.Score.score);
            
            document.location.reload(true); 
           
    }
  },
  events: {
    registered: false,
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    },
    registerEvents: function () {
      var registered = DragonCry.events.registered;
      if (!registered) {
        window.onkeydown = DragonCry.events.eventOnKeyDown;
        window.onkeyup = DragonCry.events.eventOnKeyUp;
      }
      DragonCry.events.registered = !registered;
    },
    eventOnKeyDown(e) {
      var kc = e.keyCode;
      if (kc === 65) DragonCry.events.keys.left = true;
      else if (kc === 87) DragonCry.events.keys.up = true;
      else if (kc === 68) DragonCry.events.keys.right = true;
      else if (kc === 83) DragonCry.events.keys.down = true;
    },
    eventOnKeyUp(e) {
      var kc = e.keyCode;
      if (kc === 65) DragonCry.events.keys.left = false;
      else if (kc === 87) DragonCry.events.keys.up = false;
      else if (kc === 68) DragonCry.events.keys.right = false;
      else if (kc === 83) DragonCry.events.keys.down = false;
    }
  }
};
/*window.onload = DragonCry.game.startGame;*/
var click = document.getElementById('mujDrakAnimace');
click.onclick = DragonCry.game.startGame;