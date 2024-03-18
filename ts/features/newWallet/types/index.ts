// Used to group the cards in the wallet.
export type WalletCardCategory = "itw" | "cgn" | "bonus" | "payment";

// Basic type definition for a wallet card, describes the properties that
// each card MUST have in order to be placed inside the wallet.
type WalletCardBase = {
  key: string;
  category: WalletCardCategory;
};

// Specific type for ID Pay bonus cards
export type WalletCardBonus = {
  type: "idPay";
  // TODO SIW-950 add types for ID Pay initiatives cards
};

// Specific type for CGN bonus cards
export type WalletCardCgn = {
  type: "cgn";
  // TODO SIW-952 add types for CGN card
};

// Specific type for payment cards
export type WalletCardPayment = {
  type: "payment";
  // TODO SIW-951 add types for payment cards
};

export type WalletCard = WalletCardBase &
  (WalletCardBonus | WalletCardCgn | WalletCardPayment);
// Used to map the card to the specific component that will render the card.
export type WalletCardType = WalletCard["type"];
