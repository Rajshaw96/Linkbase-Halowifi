// Disable right-click
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Disable keyboard shortcuts
document.addEventListener('keydown', function (e) {
  if (e.key === "F12" || e.code === "F12") {
    e.preventDefault();
    return false;
  }

  // Prevent Ctrl+U (View Source)
  if (e.ctrlKey && e.key.toLowerCase() === "u") {
    e.preventDefault();
    return false;
  }

  // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
  if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
    e.preventDefault();
    return false;
  }

  // Prevent Ctrl+S (Save) and Ctrl+P (Print)
  if (e.ctrlKey && ["s", "p"].includes(e.key.toLowerCase())) {
    e.preventDefault();
    return false;
  }
});

// Block DevTools detection via debugging
const blockDevTools = setInterval(() => {
  const devtools = /./;
  devtools.toString = function () {
    clearInterval(blockDevTools);
  };
}, 1000);

// Alternative: disable access to document
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.location.href = 'about:blank';
  }
});