
import PDFDocument from 'pdfkit';
import { SalesOrder, PurchaseOrder, SalesOrderLine, PurchaseOrderLine, Product } from '../types/index.js';

export class PDFService {
  static async generateSalesInvoice(so: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#444444').fontSize(20).text('SHIV FURNITURE WORKS', 110, 57);
      doc.fontSize(10).text('123 Woodcraft Street, Furniture Hub', 110, 80);
      doc.text('City, State, ZIP - 560001', 110, 95);
      doc.moveDown();

      // Invoice Info
      doc.fillColor('#444444').fontSize(20).text('INVOICE', 50, 160);
      doc.fontSize(10).text(`Invoice Number: INV-${so.id.slice(0, 8).toUpperCase()}`, 50, 200);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 215);
      doc.text(`Order Date: ${new Date(so.createdAt).toLocaleDateString()}`, 50, 230);
      
      // Customer Info
      doc.text('Bill To:', 300, 200, { fontWeight: 'bold' });
      doc.text(so.customerName, 300, 215);
      doc.text(so.customerAddress || 'N/A', 300, 230);

      // Table Header
      let y = 300;
      doc.fillColor('#8c7e6a').rect(50, y, 500, 20).fill();
      doc.fillColor('#FFFFFF').fontSize(10).text('Product', 60, y + 5);
      doc.text('Quantity', 250, y + 5);
      doc.text('Price', 350, y + 5);
      doc.text('Total', 480, y + 5);

      // Table Body
      doc.fillColor('#444444');
      y += 25;
      so.orderLines.forEach((line: any) => {
        doc.text(line.product?.name || 'Product', 60, y);
        doc.text(line.quantity.toString(), 250, y);
        doc.text(`₹${line.price.toLocaleString()}`, 350, y);
        doc.text(`₹${(line.quantity * line.price).toLocaleString()}`, 480, y);
        y += 20;
      });

      // Footer
      doc.rect(50, y + 10, 500, 1).fill('#EEEEEE');
      doc.fontSize(15).text(`Grand Total: ₹${so.totalAmount.toLocaleString()}`, 350, y + 30, { bold: true });

      doc.fontSize(10).text('Thank you for choosing Shiv Furniture Works!', 50, 700, { align: 'center', width: 500 });
      
      doc.end();
    });
  }

  static async generatePurchaseOrder(po: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#444444').fontSize(20).text('SHIV FURNITURE WORKS', 110, 57);
      doc.fontSize(10).text('PURCHASE ORDER', 50, 160);
      
      // PO Info
      doc.fontSize(10).text(`PO Number: PUR-${po.id.slice(0, 8).toUpperCase()}`, 50, 200);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 215);
      
      // Vendor Info
      doc.text('Vendor:', 300, 200, { fontWeight: 'bold' });
      doc.text(po.vendorName, 300, 215);
      doc.text(po.vendorAddress || 'N/A', 300, 230);

      // Table Header
      let y = 300;
      doc.fillColor('#b08e48').rect(50, y, 500, 20).fill();
      doc.fillColor('#FFFFFF').fontSize(10).text('Product', 60, y + 5);
      doc.text('Quantity', 250, y + 5);
      doc.text('Price', 350, y + 5);
      doc.text('Total', 480, y + 5);

      // Table Body
      doc.fillColor('#444444');
      y += 25;
      po.orderLines.forEach((line: any) => {
        doc.text(line.product?.name || 'Product', 60, y);
        doc.text(line.quantity.toString(), 250, y);
        doc.text(`₹${line.price.toLocaleString()}`, 350, y);
        doc.text(`₹${(line.quantity * line.price).toLocaleString()}`, 480, y);
        y += 20;
      });

      // Total
      doc.fontSize(15).text(`Total Amount: ₹${po.totalAmount.toLocaleString()}`, 350, y + 30, { bold: true });

      doc.end();
    });
  }
}
