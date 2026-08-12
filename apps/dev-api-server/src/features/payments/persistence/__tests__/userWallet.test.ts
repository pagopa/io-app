import { GuestMethodLastUsageTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/GuestMethodLastUsageType";
import { WalletLastUsageTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/WalletLastUsageType";
import { WalletApplicationStatusEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletClientStatusEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletClientStatus";
import { WalletStatusEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletStatus";
import * as E from "fp-ts/lib/Either";

import userWallet from "../userWallet";

describe("userWallet", () => {
  beforeEach(() => {
    const wallets = userWallet.getUserWallets();
    wallets.forEach(wallet => userWallet.removeUserWallet(wallet.walletId));
  });

  describe("generateUserWallet", () => {
    it("should generate a wallet with valid data", () => {
      const wallet = userWallet.generateUserWallet(1);

      expect(wallet).toBeDefined();
      expect(wallet.walletId).toBeDefined();
      expect(wallet.paymentMethodId).toBe("1");
      expect(wallet.status).toBe(WalletStatusEnum.VALIDATED);
      expect(wallet.clients.IO.status).toBe(WalletClientStatusEnum.ENABLED);
      expect(wallet.applications[0].status).toBe(
        WalletApplicationStatusEnum.ENABLED
      );
    });

    it("should generate a wallet with extra details", () => {
      const extraDetails = { expiryDate: "202412" };
      const wallet = userWallet.generateUserWallet(1, extraDetails);

      expect(wallet.details).toBeDefined();
      if (wallet.details && "expiryDate" in wallet.details) {
        expect(wallet.details.expiryDate).toBe(extraDetails.expiryDate);
      }
    });
  });

  describe("getUserWallets", () => {
    it("should return empty array when no wallets exist", () => {
      const wallets = userWallet.getUserWallets();
      expect(wallets).toHaveLength(0);
    });

    it("should return all wallets", () => {
      const wallet1 = userWallet.generateUserWallet(1);
      const wallet2 = userWallet.generateUserWallet(2);

      const wallets = userWallet.getUserWallets();
      expect(wallets).toHaveLength(2);
      expect(wallets).toContainEqual(wallet1);
      expect(wallets).toContainEqual(wallet2);
    });
  });

  describe("getUserWalletInfo", () => {
    it("should return undefined for non-existent wallet", () => {
      const wallet = userWallet.getUserWalletInfo("non-existent-id");
      expect(wallet).toBeUndefined();
    });

    it("should return wallet info for existing wallet", () => {
      const generatedWallet = userWallet.generateUserWallet(1);
      const wallet = userWallet.getUserWalletInfo(generatedWallet.walletId);

      expect(wallet).toBeDefined();
      expect(wallet).toEqual(generatedWallet);
    });
  });

  describe("addUserWallet", () => {
    it("should add a new wallet", () => {
      const wallet = userWallet.generateUserWallet(1);
      userWallet.removeUserWallet(wallet.walletId);

      userWallet.addUserWallet(wallet);
      const retrievedWallet = userWallet.getUserWalletInfo(wallet.walletId);

      expect(retrievedWallet).toEqual(wallet);
    });
  });

  describe("removeUserWallet", () => {
    it("should remove an existing wallet", () => {
      const wallet = userWallet.generateUserWallet(1);
      userWallet.removeUserWallet(wallet.walletId);

      const retrievedWallet = userWallet.getUserWalletInfo(wallet.walletId);
      expect(retrievedWallet).toBeUndefined();
    });
  });

  describe("updateUserWalletApplication", () => {
    it("should return left when wallet not found", () => {
      const result = userWallet.updateUserWalletApplication(
        "non-existent-id",
        []
      );
      expect(E.isLeft(result)).toBe(true);
    });

    it("should update wallet applications", () => {
      const wallet = userWallet.generateUserWallet(1);
      const newApplications = [
        {
          name: "NEW_APP",
          status: WalletApplicationStatusEnum.DISABLED
        }
      ];

      const result = userWallet.updateUserWalletApplication(
        wallet.walletId,
        newApplications
      );

      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.applications).toHaveLength(1);
        expect(result.right.applications[0].name).toBe("NEW_APP");
        expect(result.right.applications[0].status).toBe(
          WalletApplicationStatusEnum.DISABLED
        );
      }
    });
  });

  describe("setRecentUsedPaymentMethod", () => {
    it("should set wallet as recent payment method", () => {
      const walletId = "test-wallet-id";
      userWallet.setRecentUsedPaymentMethod(
        walletId,
        WalletLastUsageTypeEnum.wallet
      );

      const recentMethod = userWallet.getRecentusedPaymentMethod();
      expect(recentMethod).toBeDefined();
      expect(recentMethod?.type).toBe(WalletLastUsageTypeEnum.wallet);
      if (recentMethod && "walletId" in recentMethod) {
        expect(recentMethod.walletId).toBe(walletId);
      }
    });

    it("should set payment method as recent payment method", () => {
      const paymentMethodId = "test-payment-method-id";
      userWallet.setRecentUsedPaymentMethod(
        paymentMethodId,
        GuestMethodLastUsageTypeEnum.guest
      );

      const recentMethod = userWallet.getRecentusedPaymentMethod();
      expect(recentMethod).toBeDefined();
      expect(recentMethod?.type).toBe(GuestMethodLastUsageTypeEnum.guest);
      if (recentMethod && "paymentMethodId" in recentMethod) {
        expect(recentMethod.paymentMethodId).toBe(paymentMethodId);
      }
    });
  });

  describe("getRecentusedPaymentMethod", () => {
    it("should return the most recent payment method", () => {
      const walletId = "test-wallet-id";
      userWallet.setRecentUsedPaymentMethod(
        walletId,
        WalletLastUsageTypeEnum.wallet
      );

      const recentMethod = userWallet.getRecentusedPaymentMethod();
      expect(recentMethod).toBeDefined();
      if (recentMethod && "walletId" in recentMethod) {
        expect(recentMethod.walletId).toBe(walletId);
      }
    });
  });
});
