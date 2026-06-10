export async function shareStatsCard(
  profile,
  totalKg,
  periodLabel,
  isOverBudget
) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, '#15803d'); // green-700
  gradient.addColorStop(1, '#166534'); // green-800
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 600, 400);

  // Card background
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;

  ctx.beginPath();
  ctx.roundRect(40, 40, 520, 320, 24);
  ctx.fill();
  ctx.shadowColor = 'transparent'; // reset

  // Title
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CarbonLedger', 300, 100);

  // Period
  ctx.fillStyle = '#6b7280';
  ctx.font = '20px "Inter", sans-serif';
  ctx.fillText(periodLabel, 300, 140);

  // Total
  ctx.fillStyle = '#1a2e05';
  ctx.font = 'bold 72px "Outfit", sans-serif';
  ctx.fillText(totalKg.toFixed(1) + ' kg', 300, 230);

  ctx.fillStyle = '#6b7280';
  ctx.font = '18px "Inter", sans-serif';
  ctx.fillText('Total Emissions', 300, 260);

  // Message
  ctx.fillStyle = isOverBudget ? '#ef4444' : '#22c55e';
  ctx.font = 'bold 24px "Inter", sans-serif';
  const msg = isOverBudget ? 'Over Budget 🚨' : 'Under Budget 🌱';
  ctx.fillText(msg, 300, 310);

  // Footer
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px "Inter", sans-serif';
  ctx.fillText('Join me in tracking my carbon footprint!', 300, 340);

  // Download
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `carbon_stats_${Date.now()}.png`;
    a.click();
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
