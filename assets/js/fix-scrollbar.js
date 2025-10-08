// Fix para PerfectScrollbar - evitar errores cuando el elemento no existe
document.addEventListener('DOMContentLoaded', function() {
  // Solo inicializar si el elemento existe
  const scrollElement = document.querySelector('#sidenav-scrollbar');
  if (scrollElement && typeof Scrollbar !== 'undefined') {
    try {
      const options = { damping: '0.5' };
      Scrollbar.init(scrollElement, options);
    } catch (error) {
      console.log('PerfectScrollbar no se pudo inicializar:', error);
    }
  }
  
  // Fix para otros elementos de scroll
  const scrollElements = document.querySelectorAll('.ps');
  scrollElements.forEach(element => {
    if (typeof Scrollbar !== 'undefined') {
      try {
        Scrollbar.init(element);
      } catch (error) {
        console.log('PerfectScrollbar elemento no inicializado:', error);
      }
    }
  });
});