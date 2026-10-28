const $ = (id) => document.getElementById(id);
const message = $('message');
function draw(points) {
  const canvas = $('chart'), context = canvas.getContext('2d'), ratio = devicePixelRatio || 1;
  const width = canvas.clientWidth, height = canvas.clientHeight;
  canvas.width = width * ratio; canvas.height = height * ratio; context.scale(ratio, ratio);
  const values = points.map((point) => point.close), min = Math.min(...values), max = Math.max(...values);
  const x = (i) => 8 + i * (width - 16) / (values.length - 1);
  const y = (v) => height - 25 - (v - min) / (max - min || 1) * (height - 37);
  context.strokeStyle = '#e8eef5';
  for (let i = 0; i < 4; i += 1) { const lineY = 12 + i * (height - 37) / 3; context.beginPath(); context.moveTo(8, lineY); context.lineTo(width - 8, lineY); context.stroke(); }
  context.beginPath(); points.forEach((point, i) => i ? context.lineTo(x(i), y(point.close)) : context.moveTo(x(i), y(point.close)));
  context.strokeStyle = '#2873d5'; context.lineWidth = 2.5; context.stroke(); context.lineTo(x(values.length - 1), height - 25); context.lineTo(x(0), height - 25); context.closePath(); context.fillStyle = 'rgba(40,115,213,.1)'; context.fill();
  context.fillStyle = '#8492a4'; context.font = '11px monospace'; context.fillText(points[0].date, 0, height - 5); context.fillText(points.at(-1).date, width - 78, height - 5);
}
async function load() {
  message.textContent = 'Loading...'; $('content').hidden = true;
  try { const response = await fetch(`/api/stock?ticker=${encodeURIComponent($('ticker').value)}&period=${$('period').value}`); const data = await response.json(); if (!response.ok) throw Error(data.detail || 'Could not load market data.');
    $('title').textContent = data.ticker; $('currency').textContent = data.currency ? `(${data.currency})` : ''; $('asof').textContent = `Data as of: ${new Date(data.as_of).toLocaleString()}`; $('latest').textContent = data.stats.latest.toLocaleString(); $('change').textContent = `${data.stats.change_pct > 0 ? '+' : ''}${data.stats.change_pct}%`; $('change').style.color = data.stats.change_pct >= 0 ? '#247a55' : '#c15050'; $('volatility').textContent = `${data.stats.volatility_pct}%`; $('range').textContent = `${data.stats.high.toLocaleString()} / ${data.stats.low.toLocaleString()}`; $('observations').textContent = `${data.stats.observations} observations`; message.textContent = ''; $('content').hidden = false; draw(data.data);
  } catch (error) { message.textContent = error.message; }
}
$('search').onclick = load; $('ticker').onkeydown = (event) => event.key === 'Enter' && load(); addEventListener('resize', () => !$('content').hidden && load()); load();
