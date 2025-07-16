import { initI18n } from './i18n.js';

const loadHtmlPartials = async () => {
    const headerElement = document.getElementById('main-header');
    const footerElement = document.getElementById('main-footer');

    if (headerElement) {
        try {
            const response = await fetch('partials/header.html');
            headerElement.innerHTML = await response.text();
        } catch (error) {
            console.error('Failed to load header:', error);
            headerElement.innerHTML = '<p class="text-center text-red-500">Error loading header</p>';
        }
    }

    if (footerElement) {
         try {
            const response = await fetch('partials/footer.html');
            footerElement.innerHTML = await response.text();
        } catch (error) {
            console.error('Failed to load footer:', error);
            footerElement.innerHTML = '<p class="text-center text-red-500">Error loading footer</p>';
        }
    }
};

const initializePage = async () => {
    await loadHtmlPartials();
    await initI18n();
    lucide.createIcons();
};

document.addEventListener('DOMContentLoaded', initializePage);
