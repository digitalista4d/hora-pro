import { registerUser } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const roleSelectionStep = document.getElementById('role-selection-step');
    const registrationForm = document.getElementById('registration-form');
    const roleCards = document.querySelectorAll('.role-card');
    const backButton = document.getElementById('back-to-role-selection');
    const selectedRoleInput = document.getElementById('selected-role');
    const roleNameDisplay = document.getElementById('role-name-display');

    const freelancerFields = document.getElementById('freelancer-fields');
    const companyFields = document.getElementById('company-fields');
    const formTitle = document.getElementById('form-title');

    if (!roleSelectionStep || !registrationForm) {
        return;
    }

    const showFormStep = (role) => {
        selectedRoleInput.value = role;
        roleNameDisplay.textContent = role.charAt(0).toUpperCase() + role.slice(1);
        
        roleSelectionStep.classList.add('hidden');
        registrationForm.classList.remove('hidden');
        formTitle.classList.remove('hidden');

        freelancerFields.classList.add('hidden');
        companyFields.classList.add('hidden');

        if (role === 'freelancer') {
            freelancerFields.classList.remove('hidden');
        } else if (role === 'empresa') {
            companyFields.classList.remove('hidden');
        }
    };

    const showRoleSelectionStep = () => {
        registrationForm.classList.add('hidden');
        roleSelectionStep.classList.remove('hidden');
    };

    roleCards.forEach(card => {
        card.addEventListener('click', () => {
            const role = card.dataset.role;
            showFormStep(role);
        });
    });

    backButton.addEventListener('click', () => {
        showRoleSelectionStep();
    });

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Submitting registration data:', data);
        
        try {
            const result = await registerUser(data);
            if (result.success) {
                alert('Registo concluído com sucesso!');
                window.location.href = 'login.html';
            } else {
                alert('Ocorreu um erro no registo.');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Falha no registo. Verifique a consola para mais detalhes.');
        }
    });
});
