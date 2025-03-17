const fr = 60; // Reduced framerate for smoother performance
let structures = [];
const spawnRate = 2; // Slightly increased spawn rate 
const maxStructures = 300; // Reduced max structures for better performance
let colorPalette = [];
const fadeDuration = 750; // Extended fade duration for smoother transitions
let noiseOffset = 0;
let lastColorFetch = 0;
const colorFetchInterval = 6000; // Longer interval for more stable color schemes

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  colorMode(RGB, 255);
  blendMode(BLEND);
  frameRate(fr);
  smooth(8);
  pixelDensity(1.5);
  
  // Pre-generate colors before spawning structures
  generateFallbackColors();
  
  // Initialize with a few structures
  for (let i = 0; i < 30; i++) {
    spawnStructure();
  }
}

function draw() {
  // Smoother background fade with slight color variation
  background(10, 24, 48, 20); 
  
  // Add subtle camera movement
  let camX = map(sin(frameCount * 0.0007), -1, 1, -50, 50);
  let camY = map(cos(frameCount * 0.0005), -1, 1, -30, 30);
  camera(camX, camY, (height / 2) / tan(PI / 6), 0, 0, 0, 0, 1, 0);
  
  // Gentle rotation
  rotateZ(frameCount * 0.001);
  rotateX(sin(frameCount * 0.0003) * 0.1);
  
  // Dynamic spawning based on frame count
  if (frameCount % spawnRate === 0 && structures.length < maxStructures) {
    spawnStructure();
  }
  
  // Check if it's time for a new color palette
  if (millis() - lastColorFetch > colorFetchInterval) {
    fetchColors();
    lastColorFetch = millis();
  }
  
  // Update noise offset for organic movement
  noiseOffset += 0.01;

  // Update and draw all structures
  for (let i = structures.length - 1; i >= 0; i--) {
    structures[i].update();
    structures[i].draw();
    if (structures[i].alpha <= 0) {
      structures.splice(i, 1);
    }
  }
}

function spawnStructure() {
  // More varied sizes
  let w = random(30, 250);
  let d = random(30, 250);
  let h = random(30, 180);
  
  // Use noise for more interesting position distribution
  let x = map(noise(noiseOffset, 0), 0, 1, -width * 1.5, width * 1.5);
  let y = map(noise(0, noiseOffset), 0, 1, -height, height);
  
  let s = new Structure(x, y, w, d, h);
  structures.push(s);
}

class Structure {
  constructor(x, y, w, d, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.d = d;
    this.h = h;
    this.age = 0;
    this.alpha = 0;
    this.fadeOut = false;
    
    // Directly assign a vibrant color instead of starting with white
    let randomColor = this.getRandomColor();
    this.color = randomColor;
    this.targetColor = randomColor;
    
    this.rotationSpeed = random(0.0002, 0.003);
    this.rotationX = random(0, TWO_PI);
    this.rotationY = random(0, TWO_PI);
    this.rotationZ = random(0, TWO_PI);
    this.scaleFactor = random(0.1, 1.1);
    this.pulseRate = random(0.01, 0.03);
    this.noiseValue = random(0, 100);
    
    // Random shape selector
    this.shapeType = random([0, 1, 2]); // 0: box, 1: rounded box, 2: custom shape
    
    // Movement pattern
    this.movePattern = random([0, 1, 2]); // Different movement patterns
  }

  getRandomColor() {
    // Always generate a vibrant color even if palette is empty
    if (colorPalette.length === 0 || random() < 0.2) {
      return color(
        random(50, 255),   // Red
        random(50, 255),   // Green
        random(150, 255),  // Blue (higher min for more vividness)
        random(180, 220)   // Alpha
      );
    }
    
    // Use color from palette with high brightness
    let baseColor = colorPalette[int(random(colorPalette.length))];
    
    // Ensure colors are bright and visible (not white)
    let r = red(baseColor);
    let g = green(baseColor);
    let b = blue(baseColor);
    
    // If color is too light (close to white), make it more saturated
    if (r > 200 && g > 200 && b > 200) {
      r = random(50, 200);
      g = random(50, 200);
      b = random(150, 255);
    }
    
    // Add variation
    return color(
      constrain(r + random(-25, 25), 20, 255),
      constrain(g + random(-25, 25), 20, 255),
      constrain(b + random(-25, 25), 20, 255),
      random(180, 220)
    );
  }

  update() {
    this.noiseValue += 0.01;
    
    // Different movement patterns for variety
    switch(this.movePattern) {
      case 0:
        // Gentle sine wave
        this.y += sin(frameCount * 0.005 + this.noiseValue) * 0.4;
        this.x += cos(frameCount * 0.003 + this.noiseValue) * 0.2;
        break;
      case 1:
        // Perlin noise-based movement
        this.y += map(noise(this.noiseValue, 0), 0, 1, -0.7, 0.7);
        this.x += map(noise(0, this.noiseValue), 0, 1, -0.5, 0.5);
        break;
      case 2:
        // Slightly orbital
        let angle = frameCount * 0.002 + this.noiseValue;
        this.x += sin(angle) * 0.3;
        this.y += cos(angle) * 0.3;
        break;
    }
    
    this.age++;

    // Smooth color transition
    if (!this.fadeOut) {
      this.color = transitionColor(this.color, this.targetColor, 0.01);
      this.alpha = min(this.alpha + 2, 180); // More gradual fade in
    }

    // Determine when to start fading out
    if (this.age > fadeDuration) {
      this.fadeOut = true;
      this.alpha -= 1.5; // More gradual fade out
    }
    
    // Occasionally change target color for variety
    if (this.age % 200 === 0 && colorPalette.length > 0) {
      this.targetColor = this.getRandomColor();
    }
  }

  draw() {
    push();
    translate(this.x, this.y, -this.h / 2);
    
    // Apply rotations with more organic feel
    rotateX(this.rotationX + frameCount * this.rotationSpeed);
    rotateY(this.rotationY + frameCount * this.rotationSpeed * 0.7);
    rotateZ(this.rotationZ + frameCount * this.rotationSpeed * 0.5);
    
    // Subtle pulsing effect
    let pulse = 1 + sin(frameCount * this.pulseRate) * 0.05;
    scale(this.scaleFactor * pulse);

    // Apply color with depth-enhanced alpha - ensure we're using the correct values
    let c = this.color;
    let r = red(c);
    let g = green(c);
    let b = blue(c);
    
    // Debug color values
    // console.log("Drawing with color:", r, g, b, this.alpha);
    
    // Ensure we're not using white (r,g,b all close to 255)
    if (r > 230 && g > 230 && b > 230) {
      r = random(50, 200);
      g = random(50, 200);
      b = random(100, 255);
    }
    
    fill(r, g, b, this.alpha);
    
    // Add a subtle glow effect 
    ambientLight(r/2, g/2, b/2);
    
    // Varied border styles
    stroke(0, 0, 0, 15);
    strokeWeight(0.8);
    
    // Draw different shapes based on shape type
    switch(this.shapeType) {
      case 0:
        // Regular box
        box(this.w, this.d, this.h);
        break;
      case 1:
        // Rounded box (emulated with multiple boxes)
        push();
        translate(0, 0, 0);
        box(this.w * 0.9, this.d * 0.9, this.h * 0.95);
        pop();
        break;
      case 2:
        // Custom geometry
        push();
        beginShape();
        // Create a more complex shape
        vertex(-this.w/2, -this.d/2, 0);
        vertex(this.w/2, -this.d/2, 0);
        vertex(this.w/2, this.d/2, 0);
        vertex(-this.w/2, this.d/2, 0);
        vertex(-this.w/2, -this.d/2, this.h);
        vertex(this.w/2, -this.d/2, this.h);
        vertex(this.w/2, this.d/2, this.h);
        vertex(-this.w/2, this.d/2, this.h);
        endShape(CLOSE);
        pop();
        break;
    }
    
    pop();
  }
}

function transitionColor(startColor, targetColor, progress) {
  // Enhanced lerp with easing
  let easing = 0.5 - cos(progress * PI) / 2;
  return lerpColor(startColor, targetColor, easing);
}

function fetchColors() {
  // Skip external API and directly generate colors
  // This ensures we always have colors even if the API isn't working
  colorPalette = generateFallbackColors();
  lastColorFetch = millis();
}

function getEnhancedColor(col) {
  // Add more depth and luminosity to colors
  let r = lerp(col.r, 255, 0.15);
  let g = lerp(col.g, 255, 0.15);
  let b = lerp(col.b, 255, 0.15);
  return color(r, g, b, 200);
}

// Make this function available to the global scope for interactivity
window.generateFallbackColors = function() {
  // Generate a vibrant color palette
  let colors = [];
  let baseHue = random(0, 360);
  
  // Create 5 vibrant colors
  for (let i = 0; i < 5; i++) {
    let hue = (baseHue + i * 72) % 360; // Golden ratio spacing around the color wheel
    let saturation = random(60, 90);
    let lightness = random(40, 70);
    let rgb = hslToRgb(hue, saturation, lightness);
    
    // Create color with appropriate alpha
    let c = color(rgb[0], rgb[1], rgb[2], 200);
    colors.push(c);
  }
  
  // Add some predefined vibrant colors to ensure variety
  colors.push(color(20, 120, 240, 200));  // Blue
  colors.push(color(240, 100, 120, 200)); // Pink
  colors.push(color(70, 210, 180, 200));  // Teal
  colors.push(color(240, 180, 20, 200));  // Gold
  colors.push(color(180, 90, 240, 200));  // Purple
  
  // Update the global colorPalette
  colorPalette = colors;
  
  // Create new structure with new color when changing sections
  spawnStructure();
  spawnStructure();
  
  return colors;
}

// For backward compatibility
function generateFallbackColors() {
  return window.generateFallbackColors();
}

// Utility function to convert HSL to RGB
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

// Utility function to convert HSL to HEX
function hslToHex(h, s, l) {
  const rgb = hslToRgb(h, s, l);
  return rgb.map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// Handle mouse clicks for interactive elements
function mousePressed() {
  // Check if any structures are clicked
  structures.forEach(structure => {
    // Add slight spin effect to all structures on any click
    structure.rotationSpeed *= random(0.8, 1.2);
  });
}