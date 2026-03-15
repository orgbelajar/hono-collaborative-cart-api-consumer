import { Resend } from "resend";
import { CartExportData } from "./model/cart-model";

const resend = new Resend(process.env.RESEND_API_KEY);

export default class MailSender {
  static generateEmailHtml(data: CartExportData): string {
    const formatRupiah = (amount: number): string =>
      amount
        .toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        .replace(/\s/g, "");

    const productRows = data.products
      .map(
        (p) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${p.productName}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatRupiah(p.price)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${p.qty}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatRupiah(p.subtotal)}</td>
        </tr>`,
      )
      .join("");

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Laporan Keranjang Belanja</h2>
        <p><strong>Keranjang:</strong> ${data.cartName}</p>
        <p><strong>Pemilik:</strong> ${data.ownerUsername}</p>
        <p><strong>Tanggal Export:</strong> ${new Date(data.exportedAt).toLocaleString("id-ID")}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Produk</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Harga</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td style="padding: 8px; border: 1px solid #ddd;">Total</td>
              <td style="padding: 8px; border: 1px solid #ddd;"></td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${data.totalItems}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatRupiah(data.totalPrice)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="color: #666; font-size: 12px;">Email ini dikirim secara otomatis dari sistem E-Commerce App.</p>
      </div>
    `;
  }

  static async sendEmail(
    targetEmail: string,
    cartName: string,
    htmlContent: string,
  ): Promise<void> {
    const { error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Collaborative Cart <onboarding@resend.dev>",
      to: [targetEmail],
      subject: `Laporan Keranjang Belanja: ${cartName}`,
      html: htmlContent,
    });

    if (error) {
      throw new Error(`Gagal mengirim email: ${error.message}`);
    }
  }
}
