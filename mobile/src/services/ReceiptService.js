import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
        return dateStr;
    }
};

export const generateAndShareReceipt = async (sale) => {
    if (!sale) {
        Alert.alert("Erreur", "Données de transaction introuvables.");
        return;
    }

    try {
        const formattedDate = formatDate(sale.transactionDate);
        const shopOwnerName = sale.shopOwner?.name || "L'Épicier";
        const shopOwnerPhone = sale.shopOwner?.phone || "Non spécifié";
        const clientName = sale.client?.name || "Client comptant";
        const clientPhone = sale.client?.phone || "Non spécifié";
        const totalAmount = sale.totalAmount || 0;

        // Compile items list rows
        const itemsHtml = (sale.items || []).map(item => {
            const prodName = item.product?.name || "Produit inconnu";
            const unitPrice = item.unitPrice || 0;
            const quantity = item.quantity || 0;
            const subtotal = unitPrice * quantity;
            return `
                <tr>
                    <td>${prodName}</td>
                    <td class="text-right">${unitPrice.toFixed(2)} DH</td>
                    <td class="text-right">${quantity}</td>
                    <td class="text-right">${subtotal.toFixed(2)} DH</td>
                </tr>
            `;
        }).join('');

        // Master invoice template
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Facture 7anoti #${sale.id}</title>
                <style>
                    body {
                        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                        color: #1e293b;
                        margin: 0;
                        padding: 30px;
                        background-color: #ffffff;
                    }
                    .invoice-box {
                        max-width: 800px;
                        margin: auto;
                        padding: 20px;
                        font-size: 14px;
                        line-height: 24px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #f1f5f9;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo-section {
                        display: flex;
                        flex-direction: column;
                    }
                    .logo {
                        font-size: 26px;
                        font-weight: 800;
                        color: #4f46e5;
                        letter-spacing: -0.5px;
                    }
                    .tagline {
                        font-size: 11px;
                        color: #64748b;
                        font-weight: bold;
                        text-transform: uppercase;
                        margin-top: 4px;
                    }
                    .invoice-details {
                        text-align: right;
                        color: #64748b;
                        font-size: 13px;
                    }
                    .invoice-details h2 {
                        margin: 0 0 8px 0;
                        color: #0f172a;
                        font-size: 20px;
                        font-weight: 800;
                        letter-spacing: -0.5px;
                    }
                    .parties {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 40px;
                        gap: 20px;
                    }
                    .party-box {
                        width: 48%;
                        background-color: #f8fafc;
                        padding: 16px;
                        border-radius: 12px;
                        border: 1px solid #f1f5f9;
                    }
                    .party-box h4 {
                        margin: 0 0 10px 0;
                        color: #4f46e5;
                        font-size: 11px;
                        font-weight: 800;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .party-box p {
                        margin: 0 0 6px 0;
                        font-size: 13px;
                        color: #334155;
                        line-height: 18px;
                    }
                    .party-box p:last-child {
                        margin-bottom: 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 35px;
                    }
                    th {
                        background-color: #f8fafc;
                        color: #64748b;
                        font-weight: 700;
                        font-size: 11px;
                        text-transform: uppercase;
                        text-align: left;
                        padding: 12px 16px;
                        border-bottom: 2px solid #e2e8f0;
                    }
                    td {
                        padding: 14px 16px;
                        border-bottom: 1px solid #f1f5f9;
                        color: #334155;
                        font-size: 13px;
                    }
                    .text-right {
                        text-align: right;
                    }
                    .total-section {
                        display: flex;
                        justify-content: flex-end;
                    }
                    .total-box {
                        width: 260px;
                        background-color: #f8fafc;
                        padding: 18px;
                        border-radius: 12px;
                        border: 1px solid #e2e8f0;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 13px;
                        color: #64748b;
                    }
                    .total-row.grand-total {
                        font-size: 17px;
                        font-weight: 800;
                        color: #0f172a;
                    }
                    .footer {
                        margin-top: 60px;
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                        border-top: 1px solid #f1f5f9;
                        padding-top: 25px;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="logo-section">
                            <span class="logo">7anoti</span>
                            <span class="tagline">Gestion de crédit de proximité</span>
                        </div>
                        <div class="invoice-details">
                            <h2>FACTURE</h2>
                            <strong>N° de transaction :</strong> #${sale.id}<br>
                            <strong>Date :</strong> ${formattedDate}<br>
                            <strong>Paiement :</strong> ${sale.paymentMethod === 'CREDIT' ? 'CRÉDIT (CARNET)' : 'CASH / COMPTANT'}<br>
                        </div>
                    </div>
                    
                    <div class="parties">
                        <div class="party-box">
                            <h4>Épicerie (Moul 7anout)</h4>
                            <p><strong>Nom :</strong> ${shopOwnerName}</p>
                            <p><strong>Tél :</strong> ${shopOwnerPhone}</p>
                        </div>
                        <div class="party-box">
                            <h4>Client</h4>
                            <p><strong>Nom :</strong> ${clientName}</p>
                            <p><strong>Tél :</strong> ${clientPhone}</p>
                        </div>
                    </div>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th class="text-right">Prix Unitaire</th>
                                <th class="text-right">Quantité</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="total-section">
                        <div class="total-box">
                            <div class="total-row grand-total">
                                <span>Total Net :</span>
                                <span>${totalAmount.toFixed(2)} DH</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        Merci de votre confiance ! A bientôt chez ${shopOwnerName}.
                    </div>
                </div>
            </body>
            </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Reçu 7anoti #${sale.id}` });
    } catch (error) {
        console.error("Error generating receipt PDF:", error);
        Alert.alert("Erreur", "Échec de la génération du reçu PDF.");
    }
};
