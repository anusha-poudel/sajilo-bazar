import { test, expect } from '@playwright/test';
import { ShopPage } from '../pages/shopPage';

let shop: ShopPage;

test.beforeEach(async ({ page }) => {
  shop = new ShopPage(page);
  await shop.goto();
});

test('P1 the toast', async () => {
  await shop.addToCart('Lokta Paper Notebook');
  await expect(shop.toast()).toBeVisible();
  await expect(shop.toast()).toHaveText('Lokta Paper Notebook added to cart');
  await expect(shop.toast()).toBeHidden();
  await expect(shop.cartCount()).toHaveText('1');
});

test('P2 sold out', async () => {
  await shop.addToCart('Singing Bowl');
  await expect(shop.cartCount()).toHaveText('1');
  await expect(shop.productButton('Singing Bowl')).toHaveText('Sold out');
  await expect(shop.productButton('Singing Bowl')).toBeDisabled();
});

test('P3 quantities', async () => {
  await shop.addToCart('Pashmina Shawl');
  await shop.addToCart('Gundruk');
  await expect(shop.cartCount()).toHaveText('2');

  await shop.increaseQty('Gundruk');
  await expect(shop.cartRow('Gundruk').getByTestId('qty')).toHaveText('2');
  await shop.increaseQty('Gundruk');
  await expect(shop.cartRow('Gundruk').getByTestId('qty')).toHaveText('3');

  await expect(shop.cartRow('Gundruk').getByTestId('line-total')).toHaveText('Rs 540.00');
  await expect(shop.subtotal()).toHaveText('Rs 5,040.00');
  await expect(shop.cartCount()).toHaveText('4');
});

test('P4 promo code', async () => {
  await shop.addToCart('Pashmina Shawl');
  await expect(shop.cartCount()).toHaveText('1');
  await shop.chooseDelivery('valley');

  await shop.applyPromo('WRONG10');
  await expect(shop.promoMessage()).toHaveText('Sorry, that code is not valid.');
  await expect(shop.discount()).toHaveText('Rs 0.00');

  await shop.applyPromo('DASHAIN10');
  await expect(shop.promoMessage()).toHaveText('DASHAIN10 applied: 10% off your items');
  await expect(shop.discount()).toHaveText('Rs 450.00');
  await expect(shop.orderTotal()).toHaveText('Rs 4,150.00');
});

test('P5 remove, both ways', async ({ page }) => {
  await shop.addToCart('Lokta Paper Notebook');
  await expect(shop.cartCount()).toHaveText('1');

  page.once('dialog', dialog => dialog.dismiss());
  await shop.removeItem('Lokta Paper Notebook');
  await expect(shop.cartRow('Lokta Paper Notebook')).toBeVisible();
  await expect(shop.cartCount()).toHaveText('1');

  page.once('dialog', dialog => dialog.accept());
  await shop.removeItem('Lokta Paper Notebook');
  await expect(shop.emptyCartText()).toBeVisible();
  await expect(shop.cartCount()).toHaveText('0');
});


test('P6 the alert', async ({ page }) => {
  await shop.addToCart('Gundruk');
  await expect(shop.cartCount()).toHaveText('1');

  let alertText = '';
  page.once('dialog', async dialog => {
    alertText = dialog.message();
    await dialog.accept();
  });
  await shop.checkoutButton().click();

  expect(alertText).toBe('Please choose a delivery area before checkout.');
  await expect(shop.checkoutSection()).toBeHidden();
});


test('P7 delivery fee', async () => {
  await shop.addToCart('Dhaka Topi');
  await expect(shop.cartCount()).toHaveText('1');

  await shop.chooseDelivery('valley');
  await expect(shop.deliveryFee()).toHaveText('Rs 100.00');
  await expect(shop.orderTotal()).toHaveText('Rs 950.00');

  await shop.chooseDelivery('outside');
  await expect(shop.deliveryFee()).toHaveText('Rs 250.00');
  await expect(shop.orderTotal()).toHaveText('Rs 1,100.00');
});

test('P8 help chat pop-up', async ({ page }) => {
  const popupPromise = page.waitForEvent('popup');
  await shop.helpButton().click();
  const popup = await popupPromise;

  await expect(popup.getByText('Sita from Sajilo Bazaar has joined the chat.')).toBeVisible();

  await popup.getByLabel('Type your message').fill('Is delivery free?');
  await popup.getByRole('button', { name: 'Send' }).click();

  await expect(popup.getByText('Is delivery free?')).toBeVisible();
  await expect(popup.getByText('Thanks for your message. We will get back to you within 10 minutes.'))
    .toBeVisible();
});

test('P9 pay with eSewa', async ({ page }) => {
  await shop.addToCart('Gundruk');
  await shop.chooseDelivery('valley');
  await expect(shop.orderTotal()).toHaveText('Rs 280.00');

  await shop.checkoutButton().click();
  await expect(shop.esewa().getByTestId('pay-amount')).toHaveText('Rs 280.00');

  await shop.payWithEsewa('9841234567', '0000');
  await expect(shop.esewa().getByRole('alert')).toHaveText('Incorrect eSewa ID or MPIN.');

  await shop.payWithEsewa('9841234567', '1234');
  await expect(page.getByRole('heading', { name: 'Order placed!' })).toBeVisible();
  await expect(shop.paidAmount()).toHaveText('Rs 280.00');
  await expect(shop.orderId()).toHaveText(/^SB-\d{6}$/);
});

test('P10 gift note and receipt tab', async ({ page }) => {
  await shop.addToCart('Dhaka Topi');
  await shop.addToCart('Ilam Orthodox Tea');
  await expect(shop.cartCount()).toHaveText('2');

  await shop.chooseDelivery('outside');
  await shop.applyPromo('DASHAIN10');
  await expect(shop.promoMessage()).toHaveText('DASHAIN10 applied: 10% off your items');
  await expect(shop.subtotal()).toHaveText('Rs 1,450.00');
  await expect(shop.discount()).toHaveText('Rs 145.00');
  await expect(shop.orderTotal()).toHaveText('Rs 1,555.00');

  await shop.checkoutButton().click();

  page.once('dialog', dialog => dialog.accept('Happy Dashain!'));
  await shop.giftButton().click();
  await expect(shop.giftNote()).toHaveText('Gift note: "Happy Dashain!"');

  await shop.payWithEsewa('9841234567', '1234');
  await expect(shop.paidAmount()).toHaveText('Rs 1,555.00');
  const orderId = await shop.orderId().textContent();

  const receiptPromise = page.waitForEvent('popup');
  await shop.receiptLink().click();
  const receipt = await receiptPromise;

  await expect(receipt.getByTestId('receipt-order-id')).toHaveText(orderId!);
  await expect(receipt.getByRole('row', { name: 'Dhaka Topi 1 Rs 850.00' })).toBeVisible();
  await expect(receipt.getByRole('row', { name: 'Ilam Orthodox Tea 1 Rs 600.00' })).toBeVisible();
  await expect(receipt.getByTestId('receipt-delivery')).toHaveText('Rs 250.00');
  await expect(receipt.getByTestId('receipt-discount')).toHaveText('Rs 145.00');
  await expect(receipt.getByTestId('receipt-total')).toHaveText('Rs 1,555.00');
  await expect(receipt.getByTestId('receipt-note')).toHaveText('Gift note: "Happy Dashain!"');
});