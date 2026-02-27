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
            const clientName = orderData.contact_person_name && orderData.contact_person_name !== "N/A"
                ? orderData.contact_person_name
                : (client.nom_et_prenom && client.nom_et_prenom !== "N/A" ? client.nom_et_prenom : 'Client de la commande');

            const clientPhone = orderData.contact_person_number && orderData.contact_person_number !== "N/A"
                ? orderData.contact_person_number
                : (client.tel && client.tel !== "N/A" ? client.tel : 'N/A');

            const clientEmail = client.email || '';
            const clientAddress = orderData.address || client.address || '';

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

                // Déterminer les prix (promo vs normal) avec une priorité au prix promo
                let actualPrice = parseFloat(item.promo_price || item.price || item.unit_price || 0);

                // Ajustement de cohérence : si on a un seul article et que le sous-total global (order_amount) diffère,
                // c'est que le prix unitaire doit être ajusté (cas des promos non renvoyées par le serveur dans les détails)
                if (items.length === 1 && orderData.order_amount !== undefined) {
                    const forcedSubtotal = parseFloat(orderData.order_amount) || 0;
                    if (forcedSubtotal > 0 && Math.abs(forcedSubtotal - (actualPrice * qty)) > 0.01) {
                        actualPrice = forcedSubtotal / qty;
                    }
                }

                const originalPrice = parseFloat(item.initial_price || item.Initialprice || (parseFloat(item.promo_price) && parseFloat(item.price) > parseFloat(item.promo_price) ? item.price : null) || actualPrice);
                const isPromo = item.promo_id || item.is_promotion || item.isPromotion || item.has_promotion || (originalPrice > actualPrice);

                const total = actualPrice * qty;

                const nameWithPromo = isPromo ? `${name} (PROMO)` : name;
                const priceDisplay = isPromo && originalPrice > actualPrice
                    ? `${actualPrice.toFixed(2)} DT (au lieu de ${originalPrice.toFixed(2)} DT)`
                    : `${actualPrice.toFixed(2)} DT`;

                return [nameWithPromo, qty.toString(), priceDisplay, `${total.toFixed(2)} DT`];
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
            const subtotalSumOfItems = items.reduce((sum, item) => {
                const actualPrice = parseFloat(item.promo_price || item.price || item.unit_price || 0);
                const qty = item.quantity || 0;
                return sum + (actualPrice * qty);
            }, 0);

            // On fait confiance à order_amount s'il est fourni (sous-total promo forcé par OrderDetails)
            const subtotalFromItems = (orderData.order_amount !== undefined && Math.abs(parseFloat(orderData.order_amount) - subtotalSumOfItems) > 0.01)
                ? parseFloat(orderData.order_amount)
                : subtotalSumOfItems;

            const deliveryFee = parseFloat(orderData.delivery_fee || orderData.delivery_charge || 0);
            const cagnotteDeduction = parseFloat(orderData.cagnotte_deduction || 0);
            const serverTotal = parseFloat(orderData.order_amount || orderData.total_amount || 0);

            // Robust calculation: Subtotal + Delivery - Cagnotte
            const calculatedTotal = Math.max(0, subtotalFromItems + deliveryFee - cagnotteDeduction);

            // usually if serverTotal matches subtotal but there ARE deductions, the server total is wrong.
            // also if serverTotal and calculatedTotal differ significantly and we have deductions, trust calculated total.
            const isServerTotalIncorrect = (Math.abs(serverTotal - subtotalFromItems) < 0.1 || Math.abs(serverTotal - calculatedTotal) > 0.1) && (deliveryFee > 0 || cagnotteDeduction > 0);

            const totalAmount = orderData.total_amount !== undefined && !isServerTotalIncorrect
                ? parseFloat(orderData.total_amount)
                : calculatedTotal;

            // Le sous-total affiché doit être la somme des articles
            const orderAmount = subtotalFromItems;

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
