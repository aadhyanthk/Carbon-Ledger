/**
 * CarbonLedger — Living Forest Animation
 * Renders an HTML5 Canvas scene that responds to the user's carbon health.
 */

let canvas, ctx;
let animationFrameId;
let healthScore = 1; // 0 to 1, where 1 is perfectly healthy
let time = 0;

// Elements
let trees = [];
let particles = [];
let clouds = [];

export function initForest(canvasElement, initialHealth = 1) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d');
  healthScore = initialHealth;
  
  resize();
  window.addEventListener('resize', resize);
  
  generateScene();
  
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animate();
}

export function updateForestHealth(newHealth, immediate = false) {
  // Smoothly transition health or snap if immediate
  if (immediate) {
    healthScore = newHealth;
  } else {
    // We'll let the animation loop slowly lerp to the target, or just do it here
    const transition = setInterval(() => {
      const diff = newHealth - healthScore;
      if (Math.abs(diff) < 0.01) {
        healthScore = newHealth;
        clearInterval(transition);
      } else {
        healthScore += diff * 0.1;
      }
    }, 50);
  }
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  
  generateScene(); // Regenerate based on new dimensions
}

function generateScene() {
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  
  // Trees (3-7 trees depending on health/progress)
  trees = [];
  const numTrees = Math.floor(3 + healthScore * 4); // 3 to 7 trees
  for (let i = 0; i < numTrees; i++) {
    trees.push({
      x: width * 0.1 + (width * 0.8 / Math.max(1, numTrees - 1)) * i + (Math.random() * 20 - 10),
      scale: 0.6 + Math.random() * 0.6,
      swayOffset: Math.random() * Math.PI * 2,
      swaySpeed: 0.02 + Math.random() * 0.02,
      type: Math.random() > 0.5 ? 'pine' : 'oak'
    });
  }

  // Clouds
  clouds = [];
  for (let i = 0; i < 4; i++) {
    clouds.push({
      x: Math.random() * width,
      y: 20 + Math.random() * 60,
      scale: 0.5 + Math.random() * 1,
      speed: 0.2 + Math.random() * 0.3
    });
  }

  // Particles (Leaves/Dust)
  particles = [];
  for (let i = 0; i < 20; i++) {
    createParticle();
  }
}

function createParticle() {
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height - height,
    vx: (Math.random() - 0.5) * 2,
    vy: 1 + Math.random() * 2,
    size: 2 + Math.random() * 4,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.1
  });
}

function lerpColor(c1, c2, t) {
  // Simple hex to rgb lerp helper
  const r1 = parseInt(c1.substring(1,3), 16), g1 = parseInt(c1.substring(3,5), 16), b1 = parseInt(c1.substring(5,7), 16);
  const r2 = parseInt(c2.substring(1,3), 16), g2 = parseInt(c2.substring(3,5), 16), b2 = parseInt(c2.substring(5,7), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function animate() {
  time += 1;
  const width = canvas.width / window.devicePixelRatio;
  const height = canvas.height / window.devicePixelRatio;
  
  ctx.clearRect(0, 0, width, height);

  // Background Sky
  const skyTop हेल्दी = '#86efac';
  const skyTopSick = '#d1d5db'; // gray
  const skyBot = '#f0fdf4';
  
  const currentSkyTop = lerpColor(skyTopSick, skyTop हेल्दी, healthScore);
  
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, currentSkyTop);
  grad.addColorStop(1, skyBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Sun
  if (healthScore > 0.5) {
    ctx.save();
    ctx.globalAlpha = (healthScore - 0.5) * 2; // Fade in sun if healthy
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(width - 50, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.beginPath();
    ctx.arc(width - 50, 50, 45 + Math.sin(time*0.05)*5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Clouds
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + (1 - healthScore) * 0.4})`; // thicker clouds when sick
  clouds.forEach(c => {
    c.x += c.speed;
    if (c.x > width + 100) c.x = -100;
    
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.scale, c.scale);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI*2);
    ctx.arc(20, -10, 25, 0, Math.PI*2);
    ctx.arc(40, 0, 20, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  });

  // Ground
  const groundHealthy = '#22c55e';
  const groundSick = '#92400e'; // brown
  ctx.fillStyle = lerpColor(groundSick, groundHealthy, healthScore);
  ctx.beginPath();
  ctx.moveTo(0, height - 40);
  ctx.quadraticCurveTo(width / 2, height - 60, width, height - 30);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.fill();

  // Trees
  const leafHealthy = '#15803d';
  const leafSick = '#b45309';
  const trunk = '#451a03';

  trees.forEach((tree, i) => {
    ctx.save();
    ctx.translate(tree.x, height - 45); // anchor to ground
    const sway = Math.sin(time * tree.swaySpeed + tree.swayOffset) * 0.05 * healthScore; // less sway when sick
    ctx.rotate(sway);
    ctx.scale(tree.scale, tree.scale);

    // Trunk
    ctx.fillStyle = trunk;
    ctx.fillRect(-6, -60, 12, 60);

    // Leaves
    ctx.fillStyle = lerpColor(leafSick, leafHealthy, healthScore);
    
    if (tree.type === 'pine') {
      ctx.beginPath();
      ctx.moveTo(0, -120);
      ctx.lineTo(30, -40);
      ctx.lineTo(-30, -40);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, -90);
      ctx.lineTo(35, -20);
      ctx.lineTo(-35, -20);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, -70, 30, 0, Math.PI*2);
      ctx.arc(-20, -50, 25, 0, Math.PI*2);
      ctx.arc(20, -50, 25, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
  });

  // Particles
  const pColorHealthy = '#4ade80';
  const pColorSick = '#d97706';
  ctx.fillStyle = lerpColor(pColorSick, pColorHealthy, healthScore);
  
  particles.forEach((p, i) => {
    p.x += p.vx + Math.sin(time*0.02 + p.y*0.01); // wind effect
    p.y += p.vy * (2 - healthScore); // fall faster when sick
    p.rot += p.rotSpeed;

    if (p.y > height) {
      particles.splice(i, 1);
      createParticle();
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    ctx.restore();
  });

  animationFrameId = requestAnimationFrame(animate);
}

export function cleanupForest() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', resize);
}
