let translations = {};

const getPreferredLanguage = () => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) return savedLang;

    const browserLang = navigator.language.split('-')[0];
    if (['pt', 'en', 'fr'].includes(browserLang)) {
        return browserLang;
    }
    return 'pt'; // Default language
};

const loadTranslations = async (lang) => {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json`);
        }
        translations = await response.json();
    } catch (error) {
        console.error('Error loading translation file:', error);

        if (lang !== 'pt') {
            await loadTranslations('pt');
        }
    }
};

const translatePage = () => {
    document.querySelectorAll('[data-i18n-key]').forEach(element => {
        translateElement(element);
    });
};

export const translateElement = (element) => {
    const key = element.getAttribute('data-i18n-key');
    const translation = translations[key];
    if (translation) {
        if (element.hasAttribute('data-i18n-key-placeholder')) {
             element.placeholder = translation;
        } else {
            element.innerHTML = translation;
        }
    }
};

const setLanguage = async (lang) => {
    if (!['pt', 'en', 'fr'].includes(lang)) {
        lang = 'pt';
    }
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    await loadTranslations(lang);
    translatePage();
    attachLanguageSwitcherListeners(); // Re-attach listeners to the newly rendered header
};

const attachLanguageSwitcherListeners = () => {
    document.querySelectorAll('[data-lang]').forEach(button => {

        button.replaceWith(button.cloneNode(true));
    });
    
    document.querySelectorAll('[data-lang]').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = event.currentTarget.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
};


export const initI18n = async () => {
    const initialLang = getPreferredLanguage();
    await setLanguage(initialLang);
};
