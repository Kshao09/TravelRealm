document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const loginButton = document.getElementById('login');
  
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });
    }
  
    if (loginButton) {
      loginButton.addEventListener('click', () => {
        window.location.href = "https://www.w3schools.com/";
      });
    }
  });
  
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  window.addEventListener('scroll', () => {
    const scrollTopButton = document.getElementById('scroll-top-button');
    if (document.body.scrollTop > 150 || document.documentElement.scrollTop > 150) {
      scrollTopButton.style.display = 'block';
    } else {
      scrollTopButton.style.display = 'none';
    }
  });
  