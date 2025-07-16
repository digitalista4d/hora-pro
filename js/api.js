const mockFreelancerProfiles = [
    { 
        id: '1', 
        category: 'Designer Gráfica', 
        location: 'Luanda, Angola', 
        status: 'ON', 
        description: 'Especialista em identidade visual e design de interfaces com mais de 5 anos de experiência. Apaixonada por criar soluções visuais que comunicam e encantam.',
        portfolio: [
            'https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&q=80',
            'https://images.unsplash.com/photo-1572044162444-24c95c83038c?w=500&q=80',
            'https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=500&q=80'
        ],
        website: 'https://anasilva.design',
        linkedin_url: 'https://www.linkedin.com/in/anasilva-design',
        github_url: 'https://github.com/anasilva-design',
        phone: '+244 912 345 678'
    },
];

const mockCompanyProfiles = {
    'company-id': {
        id: 'company-id',
        company_name: 'SuperTech Angola',
        sector: 'Tecnologia'
    }
};

const mockUserProfiles = {
    '1': {
        id: '1',
        full_name: 'Ana Silva',
        avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    },
    'company-id': {
        id: 'company-id',
        full_name: 'Gestor da SuperTech',
        avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026708d',
    }
};

const mockInvoices = {
    'inv-123': {
        id: 'inv-123',
        client_name: 'Tech Solutions LDA',
        client_address: 'Rua da Inovação 123, Talatona, Luanda',
        issue_date: '2025-07-02',
        due_date: '2025-07-31',
        user_id: '1'
    }
};

let mockInvoiceItems = {
    'inv-123': [
        { id: 'item-1', invoice_id: 'inv-123', description: 'Desenvolvimento de Website Corporativo', quantity: 1, price: 150000.00 },
        { id: 'item-2', invoice_id: 'inv-123', description: 'Manutenção Mensal (Julho)', quantity: 1, price: 25000.00 },
        { id: 'item-3', invoice_id: 'inv-123', description: 'Consultoria SEO (horas)', quantity: 10, price: 5000.00 },
    ]
};

export const getFreelancerById = async (id) => {
    console.log(`Fetching freelancer with id: ${id}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const freelancerProfile = mockFreelancerProfiles.find(f => f.id === id);
            const userProfile = mockUserProfiles[id];
            
            if (freelancerProfile && userProfile) {
                const fullProfile = {
                    ...freelancerProfile,
                    name: userProfile.full_name,
                    avatar: userProfile.avatar_url
                };
                resolve(fullProfile);
            } else {
                resolve(null);
            }
        }, 500);
    });
};

export const getProfileForEdit = async (userId) => {
    console.log(`Fetching profile for edit for user: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const userProfile = mockUserProfiles[userId];
            const freelancerProfile = mockFreelancerProfiles.find(f => f.id === userId);
            const companyProfile = mockCompanyProfiles[userId];
            resolve({
                ...userProfile,
                ...freelancerProfile,
                ...companyProfile
            });
        }, 300);
    });
};

export const updateProfile = async (userId, data) => {
    console.log(`Updating profile for user ${userId} with data:`, data);
    return new Promise(resolve => {
        setTimeout(() => {
            if (mockUserProfiles[userId]) {
                mockUserProfiles[userId].full_name = data.full_name;
                mockUserProfiles[userId].avatar_url = data.avatar_url;
            }
            const freelancerProfile = mockFreelancerProfiles.find(f => f.id === userId);
            if (freelancerProfile) {
                freelancerProfile.website = data.website;
                freelancerProfile.linkedin_url = data.linkedin_url;
                freelancerProfile.github_url = data.github_url;
                freelancerProfile.phone = data.phone;
            }
            if (mockCompanyProfiles[userId]) {
                mockCompanyProfiles[userId].company_name = data.company_name;
                mockCompanyProfiles[userId].sector = data.sector;
            }
            console.log('Updated Mocks:', { mockUserProfiles, mockFreelancerProfiles, mockCompanyProfiles });
            resolve({ success: true });
        }, 1000);
    });
};


export const getFreelancers = async () => {
    console.log('Fetching all freelancers...');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockFreelancerProfiles);
        }, 500);
    });
};

export const loginUser = async (email, password) => {
    console.log(`Attempting to log in user: ${email}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let user = null;
            if (email === 'freelancer@example.com' && password === 'password') {
                user = { id: '1', email, role: 'freelancer' };
            } else if (email === 'cliente@example.com' && password === 'password') {
                user = { id: 'client-id', email, role: 'cliente' };
            } else if (email === 'empresa@example.com' && password === 'password') {
                user = { id: 'company-id', email, role: 'empresa' };
            }

            if (user) {
                console.log('Login successful for user:', user);
                resolve({ success: true, token: 'fake-jwt-token', user });
            } else {
                console.error('Invalid credentials');
                reject({ success: false, message: 'Invalid credentials' });
            }
        }, 1000);
    });
};

export const registerUser = async (userData) => {
    console.log('Registering new user with data:', userData);
    return new Promise(resolve => {
        setTimeout(() => {
            const newUserId = `new-user-${Math.random().toString(36).substr(2, 9)}`;
            const newUser = {
                id: newUserId,
                email: userData.email,
                role: userData.role,
            };
            mockUserProfiles[newUserId] = {
                id: newUserId,
                full_name: userData.full_name,
                avatar_url: ''
            };
            console.log('User created:', newUser);
            
            if(userData.role === 'freelancer') {
                console.log('Freelancer profile created for user:', newUser.id, {category: userData.category, location: userData.location});
            } else if (userData.role === 'empresa') {
                const newCompanyProfile = {
                    id: newUserId,
                    company_name: userData.company_name,
                    sector: userData.sector
                };
                mockCompanyProfiles[newUserId] = newCompanyProfile;
                console.log('Company profile created for user:', newUser.id, newCompanyProfile);
            } else {
                 console.log('Client profile created for user:', newUser.id);
            }
            resolve({ success: true, user: newUser });
        }, 1000);
    });
};

export const getInvoiceById = async (invoiceId) => {
    console.log(`Fetching invoice with id: ${invoiceId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockInvoices[invoiceId] || null);
        }, 300);
    });
};

export const getInvoiceItems = async (invoiceId) => {
    console.log(`Fetching items for invoice: ${invoiceId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockInvoiceItems[invoiceId] || []);
        }, 300);
    });
};

export const addInvoiceItem = async (invoiceId, itemData) => {
    console.log(`Adding item to invoice ${invoiceId}:`, itemData);
    return new Promise(resolve => {
        setTimeout(() => {
            const newItem = {
                ...itemData,
                id: `item-${Date.now()}`,
                invoice_id: invoiceId
            };
            if (!mockInvoiceItems[invoiceId]) {
                mockInvoiceItems[invoiceId] = [];
            }
            mockInvoiceItems[invoiceId].push(newItem);
            resolve({ success: true, item: newItem });
        }, 500);
    });
};

export const updateInvoiceItem = async (itemId, itemData) => {
    console.log(`Updating item ${itemId} with:`, itemData);
    return new Promise(resolve => {
        setTimeout(() => {
            for (const invoiceId in mockInvoiceItems) {
                const items = mockInvoiceItems[invoiceId];
                const itemIndex = items.findIndex(item => item.id === itemId);
                if (itemIndex !== -1) {
                    items[itemIndex] = { ...items[itemIndex], ...itemData };
                    resolve({ success: true, item: items[itemIndex] });
                    return;
                }
            }
            resolve({ success: false, message: 'Item not found' });
        }, 500);
    });
};

export const deleteInvoiceItem = async (itemId) => {
    console.log(`Deleting item ${itemId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            for (const invoiceId in mockInvoiceItems) {
                const initialLength = mockInvoiceItems[invoiceId].length;
                mockInvoiceItems[invoiceId] = mockInvoiceItems[invoiceId].filter(item => item.id !== itemId);
                if (mockInvoiceItems[invoiceId].length < initialLength) {
                    resolve({ success: true });
                    return;
                }
            }
            resolve({ success: false, message: 'Item not found' });
        }, 500);
    });
};
