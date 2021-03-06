//Reset audio context
document.documentElement.addEventListener("mousedown", () => {
  if (Tone.context.state !== "running") Tone.context.resume();
});

let currentMovement = "1";
console.log("v14");

const gainNode = new Tone.Gain(0).toDestination();
const gainNode2 = new Tone.Gain(0).connect(gainNode);
const lowpass = new Tone.Filter(18000, "lowpass").connect(gainNode);
const phaser = new Tone.Phaser({
  frequency: 15,
  octaves: 5,
  baseFrequency: 1000
}).connect(lowpass);
const pitchShift = new Tone.PitchShift(0).connect(phaser);
const Lyre = new Tone.Player(
  "https://monlim.github.io/Borderlands/Audio/LyreReson.mp3"
).connect(pitchShift);
const Flute = new Tone.Player({
  url: "https://monlim.github.io/Borderlands/Audio/Flute.mp3",
  loop: true,
  playbackRate: 1,
  loopStart: 0,
  loopEnd: 1
}).connect(gainNode2);


let t1on = false;
let accelActivate = 2;
let accelDeactivate = 0.2;
function triggerSampler(accel) {
  if (accel >= accelActivate) {
    if (t1on) return;
    t1on = true;
    gainNode2.gain.rampTo(1, 0.1);
    setTimeout(function(){ 
      gainNode2.gain.rampTo(0, 0.5);
    }, 1000);
  }
  if (accel < accelDeactivate) {
    t1on = false;
  }
}

//listen for updates to Midi2 trigger note
movement.onchange = function(){
  currentMovement = movement.value;
  if (currentMovement !== "6") Flute.stop();
  if (currentMovement !== "1") Lyre.stop();
  demo_button.innerHTML = "START";
  document.getElementById("circle").style.background = "green";
  is_running = false;
};

// function updateFieldIfNotNull(fieldName, value, precision=10){
//   if (value != null)
//     document.getElementById(fieldName).innerHTML = value.toFixed(precision);
// }

function handleOrientation(event) {
  //pitchShift.pitch = scaleValue(event.beta, [-180, 180], [0, 12]);
//   updateFieldIfNotNull('Orientation_a', event.alpha);
//   updateFieldIfNotNull('Orientation_b', event.beta);
//   updateFieldIfNotNull('Orientation_g', event.gamma);
  if (event.beta < 10) pitchShift.pitch = 8;
  if (10 <= event.beta && event.beta < 60) pitchShift.pitch = 5;
  if (60 <= event.beta && event.beta < 100) pitchShift.pitch = 2;
  if (event.beta >= 100) pitchShift.pitch = 0;
  phaser.frequency.value = scaleValue(event.alpha, [0, 360], [0, 15]);
  phaser.baseFrequency = scaleValue(event.gamma, [-90, 90], [150, 3500]);
  Flute.playbackRate = scaleValue(event.beta, [-180, 180], [0.25, 2.5]);
  Flute.loopStart = scaleValue(event.alpha, [0, 360], [0, 140]);
  Flute.loopEnd = Flute.loopStart + 1;
}


let accel;
function handleMotion(event) {
  
  accel =
    event.acceleration.x ** 2 +
    event.acceleration.y ** 2 +
    event.acceleration.z ** 2;
  // updateFieldIfNotNull('All', accel);
  Lyre.volume.value = scaleValue(accel, [0, 10], [-16, 0]);
  //Flute.volume.value = scaleValue(accel, [0, 10], [-16, 0]);
  triggerSampler(accel);
}

let is_running = false;
let demo_button = document.getElementById("start_demo");

demo_button.onclick = function (e) {
  e.preventDefault();

  // Request permission for iOS 13+ devices
  if (
    DeviceMotionEvent &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission();
  }
  
  if (is_running) {
    window.removeEventListener("devicemotion", handleMotion);
    window.removeEventListener("deviceorientation", handleOrientation);
    //window.removeEventListener("shake", shakeEventDidOccur, false);
    demo_button.innerHTML = "START";
    document.getElementById("circle").style.background = "green";
    //myShakeEvent.stop();
    //Tone.Transport.stop();
    gainNode.gain.rampTo(0, 0.1);
    Lyre.stop();
    Flute.stop();
    is_running = false;
  } else {
    window.addEventListener("devicemotion", handleMotion);
    window.addEventListener("deviceorientation", handleOrientation);
    //window.addEventListener("shake", shakeEventDidOccur, false);
    document.getElementById("start_demo").innerHTML = "STOP";
    document.getElementById("circle").style.background = "red";
    if (currentMovement === "1") {
      Lyre.start();
    };
    if (currentMovement === "6") {
      Flute.start();
    };
    //myShakeEvent.start();
    //Tone.Transport.start();
    gainNode.gain.rampTo(1, 0.1);
    is_running = true;
  }
};

function scaleValue(value, from, to) {
  let scale = (to[1] - to[0]) / (from[1] - from[0]);
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
  return capped * scale + to[0];
}

// //exponential scale
// let powerScale = d3
//   .scalePow()
//   .exponent(1.4)
//   .domain([0, 6])
//   .range([0, 1])
//   .clamp(true);

// var myShakeEvent = new Shake({
//   threshold: 10, // optional shake strength threshold
//   timeout: 1000, // optional, determines the frequency of event generation
// });

// //function to call when shake occurs
// function shakeEventDidOccur() {
//   shakeDict[Math.floor(Math.random() * 27)].start();
//   //alert('shake!');
// }
