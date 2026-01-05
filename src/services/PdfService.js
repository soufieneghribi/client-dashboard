import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Service pour la génération de PDF côté client (React)
 * Réplique la logique du PdfService.dart de l'application mobile
 */
class PdfService {
    /**
     * Génère et télécharge le PDF d'une commande
     * @param {Object} orderData - Données complètes de la commande
     */
    static generateOrderPdf(orderData) {


        if (!orderData || !orderData.id) {
            throw new Error("Données de commande manquantes ou invalides");
        }

        try {
            const doc = new jsPDF();
            const orderId = orderData.id.toString();
            const createdDate = orderData.created_at_formatted || orderData.created_at || new Date().toLocaleString();

            // Config de base
            const pageWidth = doc.internal.pageSize.width;
            const margin = 15;

            // --- EN-TÊTE ---
            doc.setTextColor(0, 51, 153); // Bleu foncé
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('360TN', margin, 20);

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Votre partenaire shopping', margin, 26);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('FACTURE', pageWidth - margin - 40, 20);

            doc.setFontSize(14);
            doc.text(`#${orderId}`, pageWidth - margin - 25, 27);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const dateText = `Date: ${createdDate}`;
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, 33);

            // --- SECTION INFOS ---
            const client = orderData.client || {};
            const clientName = client.nom_et_prenom || client.name || 'N/A';
            const clientPhone = client.tel || client.phone || 'N/A';
            const clientEmail = client.email || '';
            const clientAddress = client.address || '';

            // Boîte Client
            doc.setDrawColor(200, 200, 200);
            doc.rect(margin, 45, (pageWidth / 2) - margin - 5, 35);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Client:', margin + 5, 52);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(clientName, margin + 5, 58);
            if (clientAddress) {
                const splitAddress = doc.splitTextToSize(clientAddress, (pageWidth / 2) - margin - 15);
                doc.text(splitAddress, margin + 5, 63);
            }
            doc.text(clientPhone, margin + 5, 73);
            if (clientEmail) doc.text(clientEmail, margin + 5, 78);

            // Boîte Commande
            doc.rect((pageWidth / 2) + 5, 45, (pageWidth / 2) - margin - 5, 35);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('Détails Commande:', (pageWidth / 2) + 10, 52);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text(`Statut: ${orderData.order_status || 'N/A'}`, (pageWidth / 2) + 10, 58);
            doc.text(`Paiement: ${orderData.payment_method || 'N/A'}`, (pageWidth / 2) + 10, 63);
            doc.text(`ID: ${orderData.id}`, (pageWidth / 2) + 10, 68);

            // --- TABLEAU DES ARTICLES ---
            const items = orderData.details || orderData.items || [];
            const tableData = items.map(item => {
                const article = item.article || {};
                const name = article.name || item.article_name || 'Article Inconnu';
                const qty = item.quantity || 0;
                const price = parseFloat(item.price || item.unit_price || 0);
                const total = price * qty;
                return [name, qty.toString(), `${price.toFixed(2)} DT`, `${total.toFixed(2)} DT`];
            });

            autoTable(doc, {
                startY: 90,
                head: [['Article', 'Qté', 'Prix Unitaire', 'Total']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [0, 51, 153], textColor: [255, 255, 255], fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                },
                margin: { left: margin, right: margin }
            });

            // --- TOTAUX ---
            const finalY = (doc).lastAutoTable.finalY + 10;
            const orderAmount = parseFloat(orderData.order_amount || orderData.total_amount || 0);
            const deliveryFee = parseFloat(orderData.delivery_fee || orderData.delivery_charge || 0);
            const cagnotteDeduction = parseFloat(orderData.cagnotte_deduction || 0);
            const totalAmount = orderAmount + deliveryFee - cagnotteDeduction;

            const totalX = pageWidth - margin - 60;
            doc.setFontSize(10);
            let currentY = finalY;

            doc.text('Sous-total:', totalX, currentY);
            doc.text(`${orderAmount.toFixed(2)} DT`, pageWidth - margin, currentY, { align: 'right' });

            if (deliveryFee > 0) {
                currentY += 5;
                doc.text('Livraison:', totalX, currentY);
                doc.text(`${deliveryFee.toFixed(2)} DT`, pageWidth - margin, currentY, { align: 'right' });
            }

            if (cagnotteDeduction > 0) {
                currentY += 5;
                doc.text('Cagnotte:', totalX, currentY);
                doc.text(`-${cagnotteDeduction.toFixed(2)} DT`, pageWidth - margin, currentY, { align: 'right' });
            }

            currentY += 8;
            doc.setDrawColor(150, 150, 150);
            doc.line(totalX, currentY - 5, pageWidth - margin, currentY - 5);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(0, 51, 153);
            doc.text('Total:', totalX, currentY);
            doc.text(`${totalAmount.toFixed(2)} DT`, pageWidth - margin, currentY, { align: 'right' });

            // --- FOOTER ---
            const footerY = doc.internal.pageSize.height - 20;
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, footerY, pageWidth - margin, footerY);

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Merci pour votre confiance !', pageWidth / 2, footerY + 10, { align: 'center' });

            doc.setTextColor(100, 100, 100);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('360TN - Dashboard Web', pageWidth / 2, footerY + 15, { align: 'center' });

            // Sauvegarde
            doc.save(`Facture_${orderId}.pdf`);

        } catch (error) {

            throw error;
        }
    }
}

export default PdfService;
