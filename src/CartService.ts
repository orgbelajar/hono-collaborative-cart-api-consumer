import { prisma } from "./applications/database";
import { CartExportData } from "./model/cart-model";

export default class CartService {
  static async getCartData(cartId: string): Promise<CartExportData> {
    const cart = await prisma.carts.findUnique({
      where: { id: cartId },
      include: {
        users: {
          select: { username: true },
        },
        cart_items: {
          include: {
            products: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new Error(`Cart dengan id ${cartId} tidak ditemukan`);
    }

    const products = cart.cart_items.map((item) => ({
      productName: item.products.name,
      price: item.products.price,
      qty: item.qty,
      subtotal: item.products.price * item.qty,
    }));

    const totalPrice = products.reduce((sum, p) => sum + p.subtotal, 0);
    const totalItems = products.reduce((sum, p) => sum + p.qty, 0);

    return {
      cartName: cart.name,
      ownerUsername: cart.users.username,
      products,
      totalItems,
      totalPrice,
      exportedAt: new Date().toISOString(),
    };
  }
}
