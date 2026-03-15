export type ExportOrderRequest = {
  cartId: string;
  targetEmail: string;
};

export type ExportOrderMessage = {
  cartId: string;
  targetEmail: string;
  userId: string;
  username: string;
  requestedAt: string;
};

export type CartExportData = {
  cartName: string;
  ownerUsername: string;
  products: {
    productName: string;
    price: number;
    qty: number;
    subtotal: number;
  }[];
  totalItems: number;
  totalPrice: number;
  exportedAt: string;
};
