import { getInvoiceById, getInvoiceItems } from './api.js';
import { translateElement } from './i18n.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');

    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const invoiceContent = document.getElementById('invoice-content');

    if (invoiceId) {
        renderInvoice(invoiceId);
    } else {
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
});

async function renderInvoice(invoiceId) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const invoiceContent = document.getElementById('invoice-content');

    try {
        const [invoice, items] = await Promise.all([
            getInvoiceById(invoiceId),
            getInvoiceItems(invoiceId)
        ]);
        
        if (!invoice) {
            throw new Error('Invoice not found');
        }

        populateInvoiceDetails(invoice);
        populateInvoiceItems(items);

        loadingState.style.display = 'none';
        invoiceContent.style.display = 'block';

    } catch (error) {
        console.error('Error rendering invoice:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'block';
    }
}

function populateInvoiceDetails(invoice) {
    const invoiceNumberEl = document.getElementById('invoice-number-display');
    const originalText = invoiceNumberEl.textContent.split(' ')[0] + ' ';
    invoiceNumberEl.textContent = originalText + invoice.id;

    document.getElementById('client-name').textContent = invoice.client_name;
    document.getElementById('client-address').textContent = invoice.client_address;
    document.getElementById('invoice-date-display').textContent = new Date(invoice.issue_date).toLocaleDateString();
    document.getElementById('due-date-display').textContent = new Date(invoice.due_date).toLocaleDateString();
}

function populateInvoiceItems(items) {
    const itemsBody = document.getElementById('invoice-items-body');
    itemsBody.innerHTML = '';
    let grandTotal = 0;

    const currencyFormatter = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' });
    
    if (items.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 4;
        cell.textContent = 'Nenhum item nesta fatura.';
        cell.className = 'text-center p-4 text-gray-500';
        row.appendChild(cell);
        itemsBody.appendChild(row);
    } else {
        items.forEach(item => {
            const itemTotal = item.quantity * item.price;
            grandTotal += itemTotal;

            const row = document.createElement('tr');
            row.className = 'border-b';
            
            row.innerHTML = `
                <td class="p-3">${item.description}</td>
                <td class="text-center p-3">${item.quantity}</td>
                <td class="text-right p-3">${currencyFormatter.format(item.price)}</td>
                <td class="text-right p-3 font-semibold">${currencyFormatter.format(itemTotal)}</td>
            `;
            itemsBody.appendChild(row);
        });
    }

    document.getElementById('subtotal-display').textContent = currencyFormatter.format(grandTotal);
    document.getElementById('grand-total-display').textContent = currencyFormatter.format(grandTotal);
}
