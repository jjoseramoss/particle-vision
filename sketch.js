
var img
var song

//mic
var mic;
var amplitude;

//video
let video;

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

  mic = new p5.AudioIn();
  mic.start();
  amplitude = new p5.Amplitude()

  //video setup
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide()

  fft = new p5.FFT(0.3);
}

function mousePressed(){
  userStartAudio();
  mic.start();

  amplitude.setInput(mic);
  fft.setInput(mic);

}

function draw() {
  background(255);

  let gridSize = int(map(mouseX, 0, width, 15, 50));

  video.loadPixels();
  for (let y=0; y<video.height; y+= gridSize){
    for(let x=0; x <video.width; x+= gridSize){
      let index = (y * video.width + x) * 4;
      let r = video.pixels[index];
      let dia = map(r, 0, 255, gridSize, 2);

      fill(0)
      noStroke()
      circle(x+gridSize / 2, y + gridSize/2, dia)
    }
  }

  fft.analyze()

  let micLevel = amplitude.getLevel();
  amp = map(micLevel, 0, 0.5, 0, 255);
  amp - constrain(amp, 0, 255)


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