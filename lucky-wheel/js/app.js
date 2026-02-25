// ===== Prize Configuration =====
const PRIZES = [
    { label: 'iPhone 16', emoji: '📱', color: '#ff6b6b', weight: 1 },
    { label: '1.000.000đ', emoji: '💰', color: '#ffd93d', weight: 3 },
    { label: 'AirPods Pro', emoji: '🎧', color: '#6bcb77', weight: 4 },
    { label: 'Chúc May Mắn', emoji: '🍀', color: '#4d96ff', weight: 18 },
    { label: '500.000đ', emoji: '💵', color: '#c084fc', weight: 6 },
    { label: 'Balo Laptop', emoji: '🎒', color: '#f472b6', weight: 5 },
    { label: 'Quay Lại', emoji: '🔄', color: '#38bdf8', weight: 15 },
    { label: 'Voucher 200K', emoji: '🎫', color: '#fb923c', weight: 10 },
    { label: 'Smartwatch', emoji: '⌚', color: '#34d399', weight: 3 },
    { label: 'Vé Xem Phim', emoji: '🎬', color: '#f87171', weight: 12 },
    { label: '100.000đ', emoji: '🤑', color: '#a78bfa', weight: 13 },
    { label: 'Loa Bluetooth', emoji: '🔊', color: '#fbbf24', weight: 5 },
    { label: 'Chuột Gaming', emoji: '🖱️', color: '#60a5fa', weight: 7 },
    { label: 'Sticker Pack', emoji: '🎨', color: '#e879f9', weight: 15 },
];

// ===== State =====
let currentAngle = 0;
let isSpinning = false;
let spinHistory = [];
const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const totalSegments = PRIZES.length;
const segmentAngle = (2 * Math.PI) / totalSegments;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createLEDs();
    drawWheel(0);
    renderPrizeCards();
    startLEDAnimation();
});

// ===== Draw Wheel =====
function drawWheel(rotation) {
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 5;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    for (let i = 0; i < totalSegments; i++) {
        const startAngle = i * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Gradient for each segment
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        grad.addColorStop(0, lightenColor(PRIZES[i].color, 30));
        grad.addColorStop(0.6, PRIZES[i].color);
        grad.addColorStop(1, darkenColor(PRIZES[i].color, 20));
        ctx.fillStyle = grad;
        ctx.fill();

        // Segment border
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text + Emoji
        ctx.save();
        const textAngle = startAngle + segmentAngle / 2;
        ctx.rotate(textAngle);

        // Emoji
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(PRIZES[i].emoji, radius * 0.65, 0);

        // Label
        ctx.rotate(0);
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;

        const label = PRIZES[i].label;
        if (label.length > 10) {
            // Two-line text for long labels
            const words = label.split(' ');
            const mid = Math.ceil(words.length / 2);
            const line1 = words.slice(0, mid).join(' ');
            const line2 = words.slice(mid).join(' ');
            ctx.fillText(line1, radius * 0.38, -7);
            ctx.fillText(line2, radius * 0.38, 9);
        } else {
            ctx.fillText(label, radius * 0.38, 0);
        }

        ctx.restore();
    }

    // Center circle (hub)
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    hubGrad.addColorStop(0, '#ffd93d');
    hubGrad.addColorStop(0.7, '#ffb700');
    hubGrad.addColorStop(1, '#e6a200');
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hub text
    ctx.font = 'bold 12px Outfit, sans-serif';
    ctx.fillStyle = '#1a1a2e';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 0;
    ctx.fillText('QUAY', 0, -5);
    ctx.fillText('🎯', 0, 10);

    ctx.restore();
}

// ===== Spin Logic =====
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    const spinBtn = document.getElementById('spinBtn');
    spinBtn.disabled = true;
    spinBtn.querySelector('.spin-btn-text').textContent = '⏳ Đang quay...';

    // Weighted random prize
    const prizeIndex = getWeightedRandom();

    // Calculate target angle: at least 5 full rotations + offset to land on prize
    const prizeAngle = segmentAngle * prizeIndex + segmentAngle / 2;
    // We want the prize to be at the TOP (where the pointer is)
    // The pointer is at -PI/2 (top), and we rotate clockwise
    const targetAngle = (2 * Math.PI * (5 + Math.random() * 3)) + (2 * Math.PI - prizeAngle);

    const startAngle = currentAngle;
    const totalRotation = targetAngle;
    const duration = 5000 + Math.random() * 2000; // 5-7 seconds
    const startTime = performance.now();

    // Play tick sounds via LED flashing
    let lastTickSegment = -1;

    function animate(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing: cubic ease-out for realistic deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const angle = startAngle + totalRotation * eased;

        drawWheel(angle);

        // Tick effect — flash LEDs when crossing segment boundaries
        const currentSegment = Math.floor(((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / segmentAngle);
        if (currentSegment !== lastTickSegment) {
            lastTickSegment = currentSegment;
            flashLEDs();
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            currentAngle = angle % (2 * Math.PI);
            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.querySelector('.spin-btn-text').textContent = '🎲 QUAY NGAY!';

            // Show result
            showResult(PRIZES[prizeIndex]);
            addHistory(PRIZES[prizeIndex]);
        }
    }

    requestAnimationFrame(animate);
}

// ===== Weighted Random =====
function getWeightedRandom() {
    const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.random() * totalWeight;
    for (let i = 0; i < PRIZES.length; i++) {
        random -= PRIZES[i].weight;
        if (random <= 0) return i;
    }
    return PRIZES.length - 1;
}

// ===== Show Result Modal =====
function showResult(prize) {
    const modal = document.getElementById('resultModal');
    document.getElementById('modalEmoji').textContent = prize.emoji;
    document.getElementById('modalPrize').textContent = `Bạn nhận được: ${prize.label}`;

    // Create confetti
    createConfetti();

    // Show modal with animation
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

function closeModal() {
    const modal = document.getElementById('resultModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        // Clear confetti
        document.getElementById('confettiContainer').innerHTML = '';
    }, 400);
}

// Close modal on overlay click
document.getElementById('resultModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// ===== History =====
function addHistory(prize) {
    spinHistory.unshift({
        prize: prize,
        time: new Date()
    });

    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('historyList');

    if (spinHistory.length === 0) {
        list.innerHTML = '<p class="history-empty">Chưa có lượt quay nào. Hãy bắt đầu!</p>';
        return;
    }

    list.innerHTML = spinHistory.slice(0, 20).map((item, i) => {
        const time = item.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return `
            <div class="history-item">
                <div class="history-number">${i + 1}</div>
                <div class="history-info">
                    <div class="history-prize-name">${item.prize.emoji} ${item.prize.label}</div>
                    <div class="history-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Prize Cards =====
function renderPrizeCards() {
    const grid = document.getElementById('prizesGrid');
    grid.innerHTML = PRIZES.map((prize, i) => `
        <div class="prize-card" style="--card-color: ${prize.color}">
            <div class="prize-card-emoji">${prize.emoji}</div>
            <div class="prize-card-name">${prize.label}</div>
            <style>
                .prize-card:nth-child(${i + 1})::before {
                    background: linear-gradient(90deg, transparent, ${prize.color}, transparent);
                }
            </style>
        </div>
    `).join('');
}

// ===== Background Particles =====
function createParticles() {
    const container = document.getElementById('bgParticles');
    const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#c084fc', '#f472b6'];

    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size * 2}px ${color};
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 15 + 10}s;
            animation-delay: ${Math.random() * 10}s;
        `;
        container.appendChild(particle);
    }
}

// ===== LED Ring =====
function createLEDs() {
    const ring = document.getElementById('ledRing');
    const numLEDs = 24;
    const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff'];

    for (let i = 0; i < numLEDs; i++) {
        const led = document.createElement('div');
        led.className = 'led-light';
        const angle = (i / numLEDs) * 360;
        const radians = (angle * Math.PI) / 180;
        const ringRadius = 228; // half of led-ring size
        const x = Math.cos(radians) * ringRadius;
        const y = Math.sin(radians) * ringRadius;
        const color = colors[i % colors.length];

        led.style.cssText = `
            transform: translate(${x - 5}px, ${y - 5}px);
            background: ${color};
            box-shadow: 0 0 8px ${color}, 0 0 16px ${color};
            opacity: 0.6;
        `;
        led.dataset.color = color;
        ring.appendChild(led);
    }
}

let ledAnimFrame = 0;
function startLEDAnimation() {
    const leds = document.querySelectorAll('.led-light');

    function animateLEDs() {
        ledAnimFrame++;
        leds.forEach((led, i) => {
            const phase = (ledAnimFrame * 3 + i * 15) % 360;
            const brightness = 0.4 + 0.6 * Math.abs(Math.sin((phase * Math.PI) / 180));
            led.style.opacity = brightness;
        });
        requestAnimationFrame(animateLEDs);
    }

    animateLEDs();
}

function flashLEDs() {
    const leds = document.querySelectorAll('.led-light');
    leds.forEach(led => {
        led.style.opacity = '1';
        const color = led.dataset.color;
        led.style.boxShadow = `0 0 12px ${color}, 0 0 24px ${color}, 0 0 36px ${color}`;
    });
    setTimeout(() => {
        leds.forEach(led => {
            const color = led.dataset.color;
            led.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}`;
        });
    }, 100);
}

// ===== Confetti =====
function createConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#ffd93d', '#ff6b6b', '#6bcb77', '#4d96ff', '#c084fc', '#f472b6', '#fff'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 10 + 5;
        const shapes = ['50%', '0%', '30%'];
        const borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
        piece.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${borderRadius};
            animation-duration: ${Math.random() * 2 + 1.5}s;
            animation-delay: ${Math.random() * 0.5}s;
        `;
        container.appendChild(piece);
    }
}

// ===== Color Utilities =====
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(2.55 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(2.55 * percent));
    return `rgb(${r}, ${g}, ${b})`;
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(2.55 * percent));
    return `rgb(${r}, ${g}, ${b})`;
}

// ===== Keyboard Support =====
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        spinWheel();
    }
    if (e.key === 'Escape') {
        closeModal();
    }
});
