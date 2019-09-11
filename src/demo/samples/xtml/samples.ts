// block : sample1
  async function animation(a) {
    a.iterate(".square", (a, idx) => {
      a.animate({
        left: [0, 500],
        duration: 100,
        easing: 'easeInOutCubic',
        delay: idx * 40
      });
    });
  }
// end-block