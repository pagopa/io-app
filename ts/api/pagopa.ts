import { CreditCard, CreditCardId } from "../types/CreditCard";
import { buildWalletFromCreditCard } from "../utils/converters";
import { pagoPaApiUrlPrefix } from "../config";

// Send a new version of the profile to the Proxy
export const addCard = async (
  token: string,
  card: CreditCard
): Promise<boolean> => {
  const wallet = buildWalletFromCreditCard(card);
  // temporarily hardcoding language to "en".
  // The implications of this are to be defined
  const response = await fetch(`${pagoPaApiUrlPrefix}/v1/wallet?language=en`, {
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(wallet)
  });
  const t = await response.json();
  console.warn(t);
  return response.ok;
};

export const deleteCard = async (
  token: string,
  cardId: CreditCardId
): Promise<boolean> => {
  const response = await fetch(`${pagoPaApiUrlPrefix}/v1/wallet/${cardId}`, {
    method: "delete",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
};
