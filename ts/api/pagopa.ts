import { ApiFetchResult } from ".";
import { pagoPaApiUrlPrefix } from "../config";
import { Wallet } from "../../definitions/pagopa/Wallet";

export const fetchCreditCards = async (
  token: string
): Promise<ApiFetchResult<Readonly<Wallet>>> => {
  const response = await fetch(
    `${pagoPaApiUrlPrefix}/v1/app-users/me/wallets?access_token=${token}`,
    { method: "get" }
  );
  if (response.ok) {
    const cards = await response.json();
    console.error(cards);
    return {
      isError: false,
      result: cards
    };
  } else {
    console.error(
      `The credit cards fetching operation failed with error ${response.status}`
    );
    return {
      isError: true,
      error: new Error(
        `The credit cards fetching operation failed with error ${
          response.status
        }`
      )
    };
  }
};
