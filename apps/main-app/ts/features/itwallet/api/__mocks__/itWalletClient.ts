import { ItWalletClient } from "../client.ts";

export const mockItWalletClient: Partial<ItWalletClient> = {
  isFiscalCodeWhitelisted: jest.fn()
};
