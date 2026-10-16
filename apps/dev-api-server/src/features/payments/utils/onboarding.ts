import { fakerIT as faker } from "@faker-js/faker";
import { PaymentMethodsResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv3/PaymentMethodsResponse";
import { WalletCreateResponse } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletCreateResponse";

import { serverUrl } from "../../../utils/server";
import { allPaymentMethods } from "../payloads/paymentMethods";

type GenerateOnboardingWalletDataParams = {
  contextualOnboarding: boolean;
  paymentMethodId: string;
};

export const generateOnboardablePaymentMethods = (): PaymentMethodsResponse =>
  allPaymentMethods;

export const WALLET_ONBOARDING_PATH = "/wallets/outcomes";
export const generateOnboardingWalletData = ({
  paymentMethodId,
  contextualOnboarding = false
}: GenerateOnboardingWalletDataParams): WalletCreateResponse => ({
  redirectUrl: `${serverUrl}${WALLET_ONBOARDING_PATH}?paymentMethodId=${paymentMethodId}&contextualOnboarding=${contextualOnboarding}#sessionToken=${faker.string.uuid()}`
});
