function setLanguage(language) {
    localStorage.setItem('preferredLanguage', language);
    const url = new URL(window.location.href);
    if (language === 'en') {
      url.searchParams.delete('lang');
      applyLanguage('xx');
    } else {
      url.searchParams.set('lang', language);
      applyLanguage(language);
    }
    window.history.pushState({}, '', url);
  }

function getPreferredLanguage() {
// PRIORITY 1: Check URL parameter first
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get('lang');
if (langParam) {
return langParam;
}
// PRIORITY 2: Check localStorage
const storedLang = localStorage.getItem('preferredLanguage');
if (storedLang) {
return storedLang;
}
// PRIORITY 3: Use browser language
return getBrowserLanguage() || 'en';
}

function getBrowserLanguage() {
return navigator.language.slice(0, 2);
}

let cachedTranslations = {};
function translatePosition(position) {
const currentLang = getPreferredLanguage();
if (currentLang === 'en') {
return position;}
const positionKey = position.toLowerCase();

if (cachedTranslations[currentLang] &&
    cachedTranslations[currentLang].positions &&
    cachedTranslations[currentLang].positions[positionKey]) {
  return cachedTranslations[currentLang].positions[positionKey];
}
return position;

}

function applyLanguage(language) {
console.log(language);

if (language === 'en') {
return;
}


fetch(`locales/${language}.json`)
.then(response => {
  return response.ok ? response.json() : null;
})
.then(translations => {
  // Only proceed if translations exist
  if (translations) {
    cachedTranslations[language] = translations;
      window.currentTranslations = translations;
          window.translations = translations;
      
    document.querySelectorAll('[data-i18n]').forEach(element => {
      translateElement(element, translations);
    });
    
    document.querySelector('meta[name="language"]').setAttribute('content', language);
    
    if (!window.translationObserver) {
      window.translationObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(function(node) {
              if (node.nodeType === 1) { // Element node
                if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                  translateElement(node, translations);
                }
                const elements = node.querySelectorAll ? node.querySelectorAll('[data-i18n]') : [];
                elements.forEach(function(element) {
                  translateElement(element, translations);
                });
              }
            });
          }
        });
      });
      
      window.translationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
})
.catch(() => {
});
}

// Helper function to translate a single element
function translateElement(element, translations) {
  const keys = element.getAttribute('data-i18n').split('.');
  let value = translations;
  
  for (const key of keys) {
    if (value === undefined || value === null) break;
    value = value[key];
  }
  
  if (value) {
    if (element.tagName === 'META') {
      element.setAttribute('content', value);
    } else if (element.tagName === 'INPUT') {
      element.setAttribute('placeholder', value);
    } else if (value.includes('<')) {
      element.innerHTML = value;
    } else {
      element.textContent = value;
    }
  }
}

const preferredLanguage = getPreferredLanguage();
applyLanguage(preferredLanguage);

// BUTTON LANGUAGE SWITCHER REMOVE FOR PAGES WITH NO LANGUAGE SWITCHER
document.addEventListener('DOMContentLoaded', function() {
const languageButton = document.getElementById('languageButton');
const languageDropdown = document.getElementById('languageDropdown');


if (languageButton) {
languageButton.addEventListener('click', function(e) {
  e.stopPropagation();
  languageDropdown.classList.toggle('show');
});
}

document.querySelectorAll('.language-option').forEach(option => {
option.addEventListener('click', function(e) {
  e.preventDefault();
  const lang = this.getAttribute('href').split('=')[1];
  setLanguage(lang);
  languageDropdown.classList.remove('show');
});
});

document.addEventListener('click', function(event) {
if (!event.target.closest('.language-switcher-container')) {
  if (languageDropdown) {
    languageDropdown.classList.remove('show');
  }
}
});
});


function toggleDarkMode() {
      const body = document.querySelector("body");
      body.classList.toggle("dark-mode");
      
      const isDarkMode = body.classList.contains("dark-mode");
      localStorage.setItem("darkMode", isDarkMode);
      
  }
  
  document.addEventListener('DOMContentLoaded', function() {
      const storedDarkMode = localStorage.getItem("darkMode");
      
      if (storedDarkMode === "true") {
          const body = document.querySelector("body");
          body.classList.add("dark-mode");
      }
      

  });

  function toggleFilling() {
    const radarPolygons = document.querySelectorAll('.radarPolygon');
    radarPolygons.forEach(polygon => {
      polygon.style.fill = polygon.style.fill ? '' : 'none'; // Toggle the filling
    });
  }

  function takeScreenshot() {
  const chartWrapper = document.querySelector('.chart-wrapper');
  const isDarkMode = document.body.classList.contains('dark-mode');
  chartWrapper.classList.add('screenshot-capture');
    
  const options = {
    scale: 2, 
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    allowTaint: true,
    useCORS: true,
    logging: false,
    onclone: function(clonedDocument) {
      const clonedWrapper = clonedDocument.querySelector('.chart-wrapper');
      const clonedSimilarContainer = clonedDocument.getElementById('similarPlayersContainer');
      if (clonedSimilarContainer) {
        clonedSimilarContainer.style.display = 'none';
      }
      const horizontalLine = clonedWrapper.querySelector('hr');
      if (horizontalLine) horizontalLine.style.display = 'none';
      const toggleControls = clonedWrapper.querySelector('.toggle-controls');
      if (toggleControls) toggleControls.style.display = 'none';
      const radar = clonedWrapper.querySelector('.radar');
      if (radar) {
        radar.style.display = 'block';
        radar.style.margin = '0 auto';
      }
    }
  };
  
  html2canvas(chartWrapper, options).then(canvas => {
    const imageUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imageUrl;
    downloadLink.download = 'DataMB Screenshot.png';
        document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
        chartWrapper.classList.remove('screenshot-capture');
  }).catch(error => {
  });
}