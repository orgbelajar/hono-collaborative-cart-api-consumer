import {
  connectNats,
  closeNats,
  getJetStreamManager,
} from "./applications/nats";
import { logger } from "./applications/logging";
import { Listener } from "./listener";
import { AckPolicy } from "@nats-io/jetstream";

async function main() {
  try {
    // Koneksi ke NATS dan buat stream
    await connectNats();

    // Buat consumer durable jika belum ada
    const jsm = getJetStreamManager();

    // Daftarkan consumer ke stream
    try {
      await jsm.consumers.add("EXPORT", {
        durable_name: "export-order-worker",
        filter_subject: "export.order",
        // tidak menghapus pesan dari stream sampai consumer secara eksplisit memanggil ack()
        ack_policy: AckPolicy.Explicit,
        // jumlah maksimal pesan yang akan dikirim ke consumer
        max_deliver: 3,
      });
    } catch {
      // Consumer sudah ada
    }

    // Jalankan listener
    logger.info("Consumer berhasil diinisialisasi, memulai listener...");
    await Listener.listen();
  } catch (error) {
    logger.error(
      `Gagal menginisialisasi consumer: ${(error as Error).message}`,
    );
    process.exit(1);
  }
}

main();

// Graceful shutdown saat proses dihentikan
const shutdown = async () => {
  logger.info("Menerima sinyal shutdown, menutup koneksi NATS...");
  await closeNats();
  process.exit(0);
};

process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Docker stop / kill
