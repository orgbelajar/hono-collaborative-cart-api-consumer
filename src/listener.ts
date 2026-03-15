import { getJetStreamClient } from "./applications/nats";
import { logger } from "./applications/logging";
import CartService from "./CartService";
import MailSender from "./MailSender";
import type { ExportOrderMessage } from "./model/cart-model";

export class Listener {
  static async listen(): Promise<void> {
    const js = getJetStreamClient();

    // Ambil pesan dari server
    const consumer = await js.consumers.get("EXPORT", "export-order-worker");

    logger.info("Export order consumer mulai mendengarkan pesan...");

    const messages = await consumer.consume();

    for await (const msg of messages) {
      try {
        const data: ExportOrderMessage = JSON.parse(msg.string());

        logger.info(`Memproses export order untuk cart: ${data.cartId}`);

        // Ambil data cart beserta produknya
        const cartData = await CartService.getCartData(data.cartId);

        // Generate HTML email
        const htmlContent = MailSender.generateEmailHtml(cartData);

        // Kirim email via Resend
        await MailSender.sendEmail(
          data.targetEmail,
          cartData.cartName,
          htmlContent,
        );

        logger.info(`Email laporan berhasil dikirim ke ${data.targetEmail}`);

        // Acknowledge pesan (tandai sudah diproses)
        msg.ack();
      } catch (error) {
        logger.error(
          `Gagal memproses export order: ${(error as Error).message}`,
        );

        // Jika gagalNATS akan kirim ulang (maks 3x sesuai max_deliver: 3)
        msg.nak();
      }
    }
  }
}
