import {
  completePaymentFlow,
  ensureLoggedIn,
  openPaymentFromMessage
} from "./utils";

describe("Payment", () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
    await ensureLoggedIn();
  });

  // TODO: this could be executed just one time until we have a way to reset the dev server between tests
  it("When the user want to pay starting from a message, it should allow the user to complete a payment", async () => {
    await openPaymentFromMessage();
    await completePaymentFlow();
  });
});
