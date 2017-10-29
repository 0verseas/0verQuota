const loading = {
  start: () => {
    document.getElementById('loading-wrapper').style.display = 'block';
  },
  complete: () => {
    // 延遲一點，避免殘影
    setTimeout(() => {
      document.getElementById('loading-wrapper').style.display = 'none';
    }, 100);
  }
};
