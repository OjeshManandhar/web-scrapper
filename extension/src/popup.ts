const startBtn = document.getElementById('start-btn');

function startCapture() {
  console.log('start capture');
}

if (startBtn) {
  startBtn.addEventListener('click', () => {
    startCapture();
  });
}
