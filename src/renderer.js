// ===== COSMIC TYPER — Canvas Renderer =====

const TWO_PI = Math.PI * 2;

export function renderGame(ctx, canvas, state, time) {
  const W = canvas.width;
  const H = canvas.height;

  // Screen shake
  if (state.screenShake > 0) {
    const sx = (Math.random() - 0.5) * state.screenShake * 8;
    const sy = (Math.random() - 0.5) * state.screenShake * 8;
    ctx.save();
    ctx.translate(sx, sy);
  }

  // Clear
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, W, H);

  // Slow time tint
  if (state.activeEffects.slow) {
    ctx.fillStyle = 'rgba(255, 217, 61, 0.03)';
    ctx.fillRect(0, 0, W, H);
  }

  drawStars(ctx, state.stars, time);
  drawParticles(ctx, state.particles);
  drawLasers(ctx, state.lasers);
  drawAsteroids(ctx, state.asteroids, state.lockedAsteroid, time);
  drawShip(ctx, state.ship, time, state.activeEffects.shield);
  drawPowerUpItems(ctx, state.powerUpItems, time);

  if (state.screenShake > 0) ctx.restore();
}

function drawStars(ctx, stars, time) {
  stars.forEach(star => {
    const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed * 0.001);
    const alpha = star.brightness * twinkle;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = star.layer === 0 ? '#aaccff' : star.layer === 1 ? '#8899cc' : '#556688';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, TWO_PI);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawShip(ctx, ship, time, hasShield) {
  const { x, y } = ship;
  const hover = Math.sin(time * 0.003) * 3;

  ctx.save();
  ctx.translate(x, y + hover);

  // Engine glow
  const glowSize = 15 + Math.sin(time * 0.01) * 5;
  const grd = ctx.createRadialGradient(0, 25, 2, 0, 25, glowSize);
  grd.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
  grd.addColorStop(0.5, 'rgba(123, 47, 247, 0.4)');
  grd.addColorStop(1, 'rgba(123, 47, 247, 0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(0, 25, glowSize, 0, TWO_PI);
  ctx.fill();

  // Engine flame
  ctx.fillStyle = `rgba(0, 212, 255, ${0.6 + Math.random() * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(0, 20 + 15 + Math.random() * 10);
  ctx.lineTo(8, 20);
  ctx.closePath();
  ctx.fill();

  // Ship body
  ctx.fillStyle = '#1a1a4e';
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -25);
  ctx.lineTo(-18, 20);
  ctx.lineTo(-8, 15);
  ctx.lineTo(0, 20);
  ctx.lineTo(8, 15);
  ctx.lineTo(18, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cockpit
  const cockpitGrd = ctx.createLinearGradient(0, -15, 0, 5);
  cockpitGrd.addColorStop(0, '#00d4ff');
  cockpitGrd.addColorStop(1, '#7b2ff7');
  ctx.fillStyle = cockpitGrd;
  ctx.beginPath();
  ctx.ellipse(0, -5, 5, 10, 0, 0, TWO_PI);
  ctx.fill();

  // Wing details
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-14, 12);
  ctx.lineTo(-6, -5);
  ctx.moveTo(14, 12);
  ctx.lineTo(6, -5);
  ctx.stroke();

  // Shield aura
  if (hasShield) {
    const shieldAlpha = 0.2 + 0.1 * Math.sin(time * 0.005);
    ctx.strokeStyle = `rgba(0, 212, 255, ${shieldAlpha + 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 35, 0, TWO_PI);
    ctx.stroke();
    ctx.fillStyle = `rgba(0, 212, 255, ${shieldAlpha})`;
    ctx.fill();
  }

  ctx.restore();
}

function drawAsteroids(ctx, asteroids, lockedId, time) {
  asteroids.forEach(ast => {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.rotation);
    ctx.globalAlpha = ast.opacity;

    const isLocked = lockedId === ast.id;
    const glowColor = ast.isPowerUp ? '#ffd93d' : isLocked ? '#ff2d8a' : '#7b2ff7';

    // Outer glow
    const glow = ctx.createRadialGradient(0, 0, ast.size * 0.5, 0, 0, ast.size * 1.2);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, `${glowColor}22`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, ast.size * 1.2, 0, TWO_PI);
    ctx.fill();

    // Rock body - irregular shape
    ctx.fillStyle = ast.isPowerUp ? '#2a2a1e' : '#1a1a2e';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = isLocked ? 2.5 : 1.5;
    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (TWO_PI / points) * i;
      const r = ast.size * (0.7 + 0.3 * Math.sin(i * 2.5 + ast.id));
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Craters
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(ast.size * 0.2, -ast.size * 0.15, ast.size * 0.15, 0, TWO_PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-ast.size * 0.25, ast.size * 0.2, ast.size * 0.1, 0, TWO_PI);
    ctx.fill();

    ctx.restore();

    // Word text (drawn without rotation)
    ctx.save();
    ctx.translate(ast.x, ast.y);
    const fontSize = Math.max(12, Math.min(18, 200 / ast.word.length));
    ctx.font = `bold ${fontSize}px 'Space Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Power-up icon
    if (ast.isPowerUp) {
      ctx.font = '16px sans-serif';
      ctx.fillText('⭐', 0, -ast.size - 10);
    }

    // Typed portion (green)
    const typed = ast.word.substring(0, ast.typed);
    const remaining = ast.word.substring(ast.typed);
    const fullWidth = ctx.measureText(ast.word).width;
    const typedWidth = ctx.measureText(typed).width;
    const startX = -fullWidth / 2;

    if (typed) {
      ctx.fillStyle = '#6bcb77';
      ctx.shadowColor = '#6bcb77';
      ctx.shadowBlur = 8;
      ctx.textAlign = 'left';
      ctx.fillText(typed, startX, 0);
      ctx.shadowBlur = 0;
    }

    // Remaining portion
    ctx.fillStyle = isLocked ? '#ff2d8a' : '#e8e8ff';
    ctx.shadowColor = isLocked ? '#ff2d8a' : '#7b2ff7';
    ctx.shadowBlur = isLocked ? 12 : 6;
    ctx.textAlign = 'left';
    ctx.fillText(remaining, startX + typedWidth, 0);
    ctx.shadowBlur = 0;

    ctx.restore();
  });
}

function drawLasers(ctx, lasers) {
  lasers.forEach(laser => {
    ctx.save();
    ctx.globalAlpha = laser.life;
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3 * laser.life;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(laser.fromX, laser.fromY);
    ctx.lineTo(laser.toX, laser.toY);
    ctx.stroke();

    // Inner bright line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * laser.life;
    ctx.beginPath();
    ctx.moveTo(laser.fromX, laser.fromY);
    ctx.lineTo(laser.toX, laser.toY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

function drawParticles(ctx, particles) {
  particles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  });
}

function drawPowerUpItems(ctx, items, time) {
  items.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y);
    const pulse = 1 + 0.1 * Math.sin(time * 0.005);
    ctx.scale(pulse, pulse);
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.icon, 0, 0);
    ctx.restore();
  });
}
