import { connect, type NatsConnection } from "@nats-io/transport-node";
import {
  jetstream,
  jetstreamManager,
  type JetStreamClient,
  type JetStreamManager,
} from "@nats-io/jetstream";
import { logger } from "./logging";

let natsConnection: NatsConnection;
let jetStreamClient: JetStreamClient;
let jetStreamManager: JetStreamManager;

export async function connectNats(): Promise<void> {
  const natsUrl = process.env.NATS_URL || "nats://localhost:4222";

  natsConnection = await connect({ servers: natsUrl });

  jetStreamManager = await jetstreamManager(natsConnection);
  jetStreamClient = jetstream(natsConnection);

  logger.info(`Terhubung ke NATS server di ${natsUrl}`);
}

export function getJetStreamManager(): JetStreamManager {
  if (!jetStreamManager) {
    throw new Error(
      "JetStreamManager belum tersedia. Panggil connectNats() terlebih dahulu.",
    );
  }
  return jetStreamManager;
}

export function getJetStreamClient(): JetStreamClient {
  if (!jetStreamClient) {
    throw new Error(
      "JetStream belum tersedia. Panggil connectNats() terlebih dahulu.",
    );
  }
  return jetStreamClient;
}

export async function closeNats(): Promise<void> {
  if (natsConnection) {
    await natsConnection.drain();
    logger.info("Koneksi NATS ditutup");
  }
}
