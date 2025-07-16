import { getProfileForEdit, updateProfile } from './api.js';
import { translateElement } from './i18n.js';

document.addEventListener('DOMContentLoaded', async () => {

    const MOCK_LOGGED_IN_USER = { id: 'company-id', role: 'empresa' }; 

    const form = document.getElementById('settings-form');
    if (!form) return;

    const freelancerSection = document.getElementById('freelancer-settings-section');
    const companySection = document.getElementById('company-settings-section');
    const notification = document.getElementById('notification');
    const submitButton = form.querySelector('button[type=\"submit\"]');

    const populateForm = (profile) => {
        if (!profile) return;
        document.getElementById('full_name').value = profile.full_name || '';
        document.getElementById('avatar_url').value = profile.avatar_url || '';

        if (MOCK_LOGGED_IN_USER.role === 'freelancer' && freelancerSection) {
            freelancerSection.classList.remove('hidden');
            document.getElementById('website').value = profile.website || '';
            document.getElementById('linkedin_url').value = profile.linkedin_url || '';
            document.getElementById('github_url').value = profile.github_url || '';
            document.getElementById('phone').value = profile.phone || '';
        }

        if (MOCK_LOGGED_IN_USER.role === 'empresa' && companySection) {
            companySection.classList.remove('hidden');
            document.getElementById('company_name').value = profile.company_name || '';
            document.getElementById('sector').value = profile.sector || '';
        }
    };

    const showNotification = (messageKey, isError = false) => {
        notification.textContent = '';
        notification.setAttribute('data-i18n-key', messageKey);
        translateElement(notification);
        notification.className = `p-4 mb-4 rounded-md ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
        notification.classList.remove('hidden');
        setTimeout(() => notification.classList.add('hidden'), 5000);
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Salvando...';

        const dataToUpdate = {
            full_name: document.getElementById('full_name').value,
            avatar_url: document.getElementById('avatar_url').value,
        };

        if (MOCK_LOGGED_IN_USER.role === 'freelancer') {
            dataToUpdate.website = document.getElementById('website').value;
            dataToUpdate.linkedin_url = document.getElementById('linkedin_url').value;
            dataToUpdate.github_url = document.getElementById('github_url').value;
            dataToUpdate.phone = document.getElementById('phone').value;
        }

        if (MOCK_LOGGED_IN_USER.role === 'empresa') {
            dataToUpdate.company_name = document.getElementById('company_name').value;
            dataToUpdate.sector = document.getElementById('sector').value;
        }

        try {
            const result = await updateProfile(MOCK_LOGGED_IN_USER.id, dataToUpdate);
            if (result.success) {
                showNotification('changes_saved');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            showNotification('error_saving', true);
        } finally {
            submitButton.disabled = false;
            submitButton.setAttribute('data-i18n-key', 'save_changes');
            translateElement(submitButton);
        }
    });


    try {
        const profileData = await getProfileForEdit(MOCK_LOGGED_IN_USER.id);
        if (profileData) {
            populateForm(profileData);
        } else {
            showNotification('error_loading_profile', true);
        }
    } catch (error) {
        console.error('Failed to load profile data:', error);
        showNotification('error_loading_profile', true);
    }
});
