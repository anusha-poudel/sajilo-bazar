import { Page } from '@playwright/test';

export class ShopPage {
  constructor(private page: Page) {}

  toast = () => this.page.getByTestId('toast');
  cartCount = () => this.page.getByTestId('cart-count');
  subtotal = () => this.page.getByTestId('subtotal');
  discount = () => this.page.getByTestId('discount');
  orderTotal = () => this.page.getByTestId('order-total');
  promoMessage = () => this.page.getByTestId('promo-message');
  emptyCartText = () => this.page.getByText('Your cart is empty.');
  checkoutButton = () => this.page.getByRole('button', { name: 'Proceed to checkout' });
  checkoutSection = () => this.page.locator('#checkout');

  productButton = (name: string) =>
    this.page.getByRole('listitem').filter({ hasText: name }).getByRole('button');
  cartRow = (name: string) =>
    this.page.getByTestId('cart-row').filter({ hasText: name });

  async goto() {
  await this.page.goto('/sajilo-bazaar.html');
  }
  async addToCart(name: string) {
    await this.productButton(name).click();
  }
  async increaseQty(name: string) {
    await this.cartRow(name).getByRole('button', { name: 'Increase quantity' }).click();
  }
  async removeItem(name: string) {
    await this.cartRow(name).getByRole('button', { name: 'Remove' }).click();
  }
  async chooseDelivery(area: 'valley' | 'outside') {
    await this.page.getByLabel('Delivery area').selectOption(area);
  }
  async applyPromo(code: string) {
    await this.page.getByLabel('Promo code').fill(code);
    await this.page.getByRole('button', { name: 'Apply' }).click();
  }
  deliveryFee() {
    return this.page.getByTestId('delivery-fee');
  }
  helpButton() {
    return this.page.getByRole('button', { name: 'Need help? Chat with us' });
  }
  giftButton() {
    return this.page.getByRole('button', { name: 'Add a gift note' });
  }
  giftNote() {
    return this.page.getByTestId('gift-note');
  }
  esewa() {
    return this.page.frameLocator('#esewa-frame');
  }
  orderId() {
    return this.page.getByTestId('order-id');
  }
  paidAmount() {
    return this.page.getByTestId('paid-amount');
  }
  receiptLink() {
    return this.page.getByRole('link', { name: 'View receipt' });
  }
  async payWithEsewa(id: string, mpin: string) {
    await this.esewa().getByLabel('eSewa ID').fill(id);
    await this.esewa().getByLabel('MPIN').fill(mpin);
    await this.esewa().getByRole('button', { name: 'Pay now' }).click();
  }
}