function initSplitSlider(containerId) {
  const container = document.getElementById(containerId);
  const overlay = container.querySelector('.split-overlay');
  let isSliding = false;

  container.addEventListener('mousedown', () => isSliding = true);
  window.addEventListener('mouseup', () => isSliding = false);
  
  container.addEventListener('mousemove', (e) => {
    if (!isSliding) return;
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    overlay.style.width = `${(x / rect.width) * 100}%`;
  });
}
