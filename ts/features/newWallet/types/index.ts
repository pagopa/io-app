// Used to group the cards in the wallet.
export type WalletCardCategory = "bonus" | "payment";

// Here we have a basic type definition for a wallet card.
// The card can have some base properties and some specific properties
// depending on the card type.
type WalletCardBase = {
  key: string;
  label: string;
  category?: WalletCardCategory;
};

// A bonus card has an amount and an initiativeId
export type WalletCardBonus = {
  type: "IDPAY";
  amount: number;
  initiativeId: string;
};

// A payment card has a circuit
export type WalletCardPayment = {
  type: "PAYMENT";
  circuit: string;
};

export type WalletCard = WalletCardBase & (WalletCardBonus | WalletCardPayment);
// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];
