import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateContractPDF(ana: any, cart: any[], margItems: any[]) {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();

    // Embed the StandardFonts.Helvetica font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add a blank page to the document
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    const { width, height } = page.getSize();

    // Draw header
    page.drawText('RIEPILOGO CONTRATTO - TELEFUTURA CRM', {
        x: 50,
        y: height - 50,
        size: 18,
        font: helveticaBold,
        color: rgb(0, 0, 0),
    });

    page.drawLine({
        start: { x: 50, y: height - 60 },
        end: { x: width - 50, y: height - 60 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
    });

    // Client Registry Section
    let y = height - 90;
    page.drawText('ANAGRAFICA CLIENTE', {
        x: 50,
        y,
        size: 12,
        font: helveticaBold,
    });

    y -= 25;
    const drawField = (label: string, value: string, xPos: number) => {
        page.drawText(`${label}:`, { x: xPos, y, size: 10, font: helveticaBold });
        page.drawText(value || '—', { x: xPos + 60, y, size: 10, font: helveticaFont });
    };

    drawField('Cliente', `${ana.nome} ${ana.cognome}`, 50);
    drawField('Cellulare', ana.cellulare, 250);
    y -= 15;
    drawField('Email', ana.email, 50);
    y -= 15;
    drawField('Indirizzo', `${ana.via}, ${ana.cap} ${ana.citta}`, 50);

    if (ana.ragioneSociale) {
        y -= 15;
        drawField('Azienda', ana.ragioneSociale, 50);
    }

    y -= 40;
    page.drawLine({
        start: { x: 50, y: y + 10 },
        end: { x: width - 50, y: y + 10 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
    });

    // Contract Items Section
    page.drawText('PRODOTTI E SERVIZI CONTRATTUALIZZATI', {
        x: 50,
        y,
        size: 12,
        font: helveticaBold,
    });

    y -= 30;

    // Table headers
    page.drawText('DESCRIZIONE', { x: 50, y, size: 9, font: helveticaBold });
    page.drawText('DETTAGLI', { x: 250, y, size: 9, font: helveticaBold });

    y -= 15;
    page.drawLine({
        start: { x: 50, y: y + 5 },
        end: { x: width - 50, y: y + 5 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
    });

    cart.forEach((group) => {
        group.items.forEach((item: any) => {
            if (y < 100) return; // Simple overflow check

            page.drawText(`${group.brandLabel} - ${item.sub}`, { x: 50, y, size: 9, font: helveticaBold });

            let details = Object.entries(item.details || {})
                .filter(([k, v]) => v && k !== 'hasContract')
                .map(([k, v]) => `${k}: ${v}`)
                .join(' | ');

            const detailLines = details.match(/.{1,60}(\s|$)/g) || [details];
            detailLines.forEach((line, idx) => {
                page.drawText(line.trim(), { x: 250, y: y - (idx * 10), size: 8, font: helveticaFont, color: rgb(0.3, 0.3, 0.3) });
            });

            y -= (detailLines.length * 15);
        });
    });

    // Extra products (Marginalità)
    if (margItems.length > 0) {
        y -= 20;
        page.drawText('ALTRI PRODOTTI / ACCESSORI', { x: 50, y, size: 10, font: helveticaBold });
        y -= 20;

        margItems.forEach(it => {
            if (y < 100) return;
            page.drawText(`${it.product} ${it.model ? `(${it.model})` : ''} x${it.qty}`, { x: 50, y, size: 9, font: helveticaFont });
            page.drawText(`€ ${it.price.toFixed(2)}`, { x: 500, y, size: 9, font: helveticaFont });
            y -= 15;
        });
    }

    // Footer / Signature
    y = 100;
    page.drawLine({
        start: { x: 50, y },
        end: { x: width - 50, y },
        thickness: 1,
        color: rgb(0, 0, 0),
    });

    y -= 20;
    page.drawText('Firma del Cliente per accettazione:', { x: 50, y, size: 10, font: helveticaFont });
    page.drawText('Data: ' + new Date().toLocaleDateString('it-IT'), { x: 400, y, size: 10, font: helveticaFont });

    y -= 40;
    page.drawText('________________________________', { x: 50, y, size: 10, font: helveticaFont });
    page.drawText('________________________________', { x: 350, y, size: 10, font: helveticaFont });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
}
