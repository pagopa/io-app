import { CreditCard, CreditCardId } from "../types/CreditCard";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Wallet } from "../../definitions/pagopa/Wallet";
import { AddCardState } from "../screens/wallet/AddCardScreen";

export const buildCreditCardFromState = (state: AddCardState): CreditCard => ({
  owner: state.holder.getOrElse("") as NonEmptyString,
  pan: state.pan.getOrElse(""),
  expirationDate: state.expirationDate.getOrElse("/") as NonEmptyString,
  id: -1 as CreditCardId,
  lastUsage: "?" as NonEmptyString
});

export const buildWalletFromCreditCard = (card: CreditCard): Wallet => {
  const [month, year] = card.expirationDate.split("/");
  return {
    creditCard: {
      brandLogo: "TBD",
      expireMonth: month,
      expireYear: year,
      flag3dsVerified: false,
      holder: card.owner,
      id: -1,
      pan: card.pan,
      securityCode: card.securityCode
    },
    favourite: false,
    idPagamentoFromEC: "",
    idPsp: 0,
    idWallet: 0,
    lastUsage: "",
    matchedPsp: false,
    psp: {},
    pspEditable: false,
    type: ""
  };
};
