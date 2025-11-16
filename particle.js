let video; // Our p5.js webcam capture
let backgroundCaptured = false;
let captureButton;

// OpenCV Mat objects
let currentFrame, bgFrame, diffFrame, mask;

let matsInitialized = false;
let thresholdSlider; // <-- ADD THIS


function setup() {
  createCanvas(640, 480);
  
  // Start the p5.js webcam feed
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide(); // Hide the default HTML video element
  
  // Create a button to capture the background
  captureButton = createButton('Set Background');
  captureButton.position(10, 10);
  captureButton.mousePressed(captureBackground);
  
  // We'll just check if OpenCV is loaded, but NOT init Mats
  createSpan('Threshold:').position(10, 40);
  thresholdSlider = createSlider(0, 255, 30); // Min=0, Max=255, Start=30
  thresholdSlider.position(80, 40);
  thresholdSlider.style('width', '150px');

  checkOpenCV(); 
}

// --- Helper function to wait for OpenCV ---
function checkOpenCV() {
  if (typeof cv === 'undefined') {
    setTimeout(checkOpenCV, 50); // Check again in 50ms
  } else {
    console.log("OpenCV is ready.");
    // Notice: We are no longer creating Mats here!
  }
}

// --- Function called by the button ---
function captureBackground() {
  // Check if video is loaded and Mats are ready
  if (video.loadedmetadata && matsInitialized) {
    // Load the current video frame into our bgFrame Mat
    video.loadPixels();
    currentFrame.data.set(video.pixels);
    
    // Convert to grayscale for easier comparison
    cv.cvtColor(currentFrame, bgFrame, cv.COLOR_RGBA2GRAY);
    
    backgroundCaptured = true;
    console.log("Background captured!");
  } else {
    console.log("Video not ready or Mats not initialized, try again.");
  }
}

function draw() {
  // Wait until OpenCV is loaded AND video metadata is ready
  if (typeof cv === 'undefined' || !video.loadedmetadata) {
    background(50);
    fill(255);
    textAlign(CENTER);
    text('Loading OpenCV and Webcam...', width / 2, height / 2);
    return; // Exit the draw loop until ready
  }

  // --- INITIALIZATION BLOCK ---
  // This code will run ONCE
  if (!matsInitialized) {
    // Now video.width and video.height are correct
    currentFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    bgFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    diffFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    mask = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    
    matsInitialized = true; // Set flag so this doesn't run again
    console.log("OpenCV Mats initialized with size:", video.width, "x", video.height);
  }
  // --- END OF INITIALIZATION BLOCK ---

  // Load the current live video frame into our 'currentFrame' Mat
  video.loadPixels();
  
  // --- THIS IS THE FIX ---
  // We must check that the video.pixels array actually has data in it
  // before we try to use it.
  if (currentFrame.data && video.pixels.length > 0) {
     currentFrame.data.set(video.pixels);
  } else {
    // If pixel data isn't ready, just skip this frame.
    // This prevents the RangeError.
    return; 
  }
  // --- END OF FIX ---

  let currentThreshold = thresholdSlider.value();


  if (backgroundCaptured) {
    // --- THIS IS THE MAGIC ---
    
    // 1. Convert the live frame to grayscale
    //    We must use a different output Mat here, or we'll get an error
    //    Let's use 'diffFrame' as a temporary holder
    cv.cvtColor(currentFrame, diffFrame, cv.COLOR_RGBA2GRAY); 
    
    // 2. Calculate the difference
    //    (bgFrame is already grayscale, diffFrame is now our grayscale current frame)
    cv.absdiff(bgFrame, diffFrame, diffFrame);
    
    // 3. Threshold: Turn the difference image into a pure B&W mask
    //    (Input is diffFrame, output is mask)
    cv.threshold(diffFrame, mask, currentThreshold, 255, cv.THRESH_BINARY);

    // (Optional but recommended: Clean up the noise)
    // You might want to comment these out first to see the raw mask
    let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
    cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel);
    cv.morphologyEx(mask, mask, cv.MORPH_CLOSE, kernel);
    kernel.delete();

    // 4. Draw the final B&W mask to the p5 canvas
    cv.imshow('defaultCanvas0', mask);

  } else {
    // Before background is captured, just show the live video
    image(video, 0, 0, width, height);
    
    // Add an instruction message
    fill(255, 0, 0);
    textAlign(LEFT);
    text("Step out of frame, then press 'Set Background'", 10, 40);
  }
}