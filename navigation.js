// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.nav-bar a');
  
  // Set up the content for each section
  const contentSections = {
    'home': {
      title: 'Welcome to the show',
      content: 'Create beautiful dynamic motion graphics for webpage backgrounds.'
    },
    'about': {
      title: 'About Procedural Animation',
      content: 'This demo showcases the power of p5.js with WEBGL to create immersive, interactive backgrounds. The colorful cubes are procedurally generated with various movement patterns and transitions.'
    },
    'gallery': {
      title: 'Gallery',
      content: 'This is where a gallery of products could be displayed. Data is loaded dynamically through a .js file'
    },
    'contact': {
      title: 'Get In Touch',
      content: 'Interested in implementing beautiful procedural graphics for your website? Contact me to discuss how we can bring your digital presence to life @ tkomforty@gmail.com.'
    }
  };
  
  // Create content sections in the DOM
  const contentContainer = document.querySelector('.content');
  
  // Clear any existing content
  contentContainer.innerHTML = '';
  
  // Create a section for each content type
  Object.keys(contentSections).forEach(key => {
    const section = document.createElement('div');
    section.classList.add('content-section');
    section.id = `${key}-section`;
    
    const title = document.createElement('h2');
    title.textContent = contentSections[key].title;
    
    const paragraph = document.createElement('p');
    paragraph.textContent = contentSections[key].content;
    
    section.appendChild(title);
    section.appendChild(paragraph);
    contentContainer.appendChild(section);
  });
  
  // Set Home as active by default
  document.getElementById('home-section').classList.add('active');
  navLinks[0].classList.add('active');
  
  // Add click event listeners to each nav link
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the section id from the href attribute
      const sectionId = this.getAttribute('href').substring(1);
      
      // Remove active class from all links and sections
      navLinks.forEach(link => link.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Add active class to clicked link and corresponding section
      this.classList.add('active');
      document.getElementById(`${sectionId}-section`).classList.add('active');
      
      // Trigger a color change in the animation
      if (typeof refreshColors === 'function') {
        refreshColors();
      }
      
      // Add a subtle animation effect to the content
      contentContainer.style.transform = 'scale(0.95)';
      setTimeout(() => {
        contentContainer.style.transform = 'scale(1)';
      }, 150);
    });
  });
  
  // Handle mobile optimization
  function checkMobileView() {
    if (window.innerWidth <= 768) {
      // Adjust animation performance for mobile
      if (window.reduceAnimationForMobile && typeof window.reduceAnimationForMobile === 'function') {
        window.reduceAnimationForMobile();
      }
    }
  }
  
  // Check on load and resize
  checkMobileView();
  window.addEventListener('resize', checkMobileView);
});

// Function that can be called from sketch.js to refresh colors
function refreshColors() {
  // This will be defined in sketch.js and can be called from here
  if (typeof generateFallbackColors === 'function') {
    generateFallbackColors();
  }
}
