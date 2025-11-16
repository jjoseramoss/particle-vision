
var img
var song

//mic
var mic;
var amplitude;

var fft 
var particles = []

let s1 = "everglow.mp3"
let s2 = "visible-again.mp3"

function preload() {
  song = loadSound(s1)
  img = loadImage("planet.jpg")
  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES)
  imageMode(CENTER)
  rectMode(CENTER)
  

  mic = new p5.AudioIn();
  mic.start();
  amplitude = new p5.Amplitude()

  fft = new p5.FFT(0.3);

  img.filter(BLUR, 2)
}

function mousePressed(){
  userStartAudio();
  mic.start();

  amplitude.setInput(mic);
  fft.setInput(mic);

}

function draw() {
  background(0);
  translate(width/2, height/2) // center circle

  fft.analyze()

  let micLevel = amplitude.getLevel();
  amp = map(micLevel, 0, 0.5, 0, 255);
  amp - constrain(amp, 0, 255)

  push()
  if (amp > 120){
    rotate(random(-0.5, 0.5))
  }
 
  image(img, 0, 0, width + 100, height + 100)
  pop()

  var alpha = map(amp, 0, 255, 180, 150) // darker shade
  fill(0, alpha)
  noStroke()
  rect(0, 0, width, height)
  
  stroke(255)
  strokeWeight(3)
  noFill()

  var wave = fft.waveform();


  // draw circle left and right side - smart (have two loops -1 and 1) mult t by sin to mirror
  for (var t = -1; t <= 1; t += 2){
    
      beginShape()
      for (var i = 0; i <= 180; i+= 0.5){
        var index = floor(map(i, 0, 180, 0, wave.length - 1))

        var r = map(wave[index], -1, 1, 150, 350);

        var x = r * (t * sin(i))
        var y = r * cos(i)
        vertex(x, y)
      }
      endShape()
    
  }

  var p = new Particle()
  particles.push(p)

  for (var i = particles.length - 1; i >= 0; i--){
    if(!particles[i].edges()){
      particles[i].update(amp > 230) // depending on audio
      particles[i].show()
    } else{
      particles.splice(i, 1)
    }
    
  }

}


class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(250)
    this.vel = createVector(0, 0)
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001))

    this.w = random(3,5)

    this.color = [random(200, 255), random(200, 255), random(200, 255)]
  }

  update(cond) {
    this.vel.add(this.acc)
    this.pos.add(this.vel)
    if (cond){
      this.pos.add(this.vel)
      this.pos.add(this.vel)
      this.pos.add(this.vel)

    }
  }

  edges() {
    if(this.pos.x < -width / 2 || this.pos.x > width / 2 || this.pos.y < -height / 2 || this.pos.y > height / 2){
      return true
    }else{
      return false
    }
  }

  show(){
    noStroke()
    fill(this.color)
    ellipse(this.pos.x, this.pos.y, this.w)
  }
}