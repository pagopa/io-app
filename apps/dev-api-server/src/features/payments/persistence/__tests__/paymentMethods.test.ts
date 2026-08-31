import { PaymentMethodManagementTypeEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodStatusEnum } from "@io-app/api-types/generated/definitions/pagopa/walletv3/PaymentMethodStatus";
import { WalletInfoDetails } from "@io-app/api-types/generated/definitions/pagopa/walletv3/WalletInfoDetails";

import {
  generateRandomCardBrand,
  generateWalletDetailsByPaymentMethod,
  paymentMethodsDB
} from "../paymentMethods";

// Type guards
const isCardDetails = (
  details: WalletInfoDetails
): details is WalletInfoDetails & {
  brand: string;
  expiryDate: string;
  lastFourDigits: string;
  type: "CARDS";
} => details.type === "CARDS";

const isPayPalDetails = (
  details: WalletInfoDetails
): details is WalletInfoDetails & {
  maskedEmail: string;
  pspBusinessName: string;
  pspId: string;
  type: "PAYPAL";
} => details.type === "PAYPAL";

const isBpayDetails = (
  details: WalletInfoDetails
): details is WalletInfoDetails & {
  bankName: string;
  instituteCode: string;
  maskedNumber: string;
  type: "BPAY";
} => details.type === "BPAY";

describe("Payment Methods", () => {
  describe("generateRandomCardBrand", () => {
    it("should return a valid card brand", () => {
      const brand = generateRandomCardBrand();
      expect(["VISA", "MASTERCARD", "AMEX", "MAESTRO"]).toContain(brand);
    });

    it("should return different brands on multiple calls", () => {
      const brands = new Set(
        Array.from({ length: 10 }, () => generateRandomCardBrand())
      );
      expect(brands.size).toBeGreaterThan(1);
    });
  });

  describe("paymentMethodsDB", () => {
    it("should contain all required payment methods", () => {
      expect(paymentMethodsDB).toHaveLength(4);
      expect(paymentMethodsDB.map(pm => pm.name)).toEqual([
        "CARDS",
        "PAYPAL",
        "BANCOMATPAY",
        "POSTEPAY"
      ]);
    });

    it("should have valid payment method properties", () => {
      paymentMethodsDB.forEach(paymentMethod => {
        expect(paymentMethod).toHaveProperty("id");
        expect(paymentMethod).toHaveProperty("name");
        expect(paymentMethod).toHaveProperty("description");
        expect(paymentMethod).toHaveProperty("asset");
        expect(paymentMethod).toHaveProperty("status");
        expect(paymentMethod).toHaveProperty("paymentTypeCode");
        expect(paymentMethod).toHaveProperty("ranges");
        expect(paymentMethod).toHaveProperty("methodManagement");
      });
    });

    it("should have valid status values", () => {
      paymentMethodsDB.forEach(paymentMethod => {
        expect(paymentMethod.status).toBe(PaymentMethodStatusEnum.ENABLED);
      });
    });

    it("should have valid management types", () => {
      const managementTypes = paymentMethodsDB.map(pm => pm.methodManagement);
      expect(managementTypes).toContain(
        PaymentMethodManagementTypeEnum.ONBOARDABLE
      );
      expect(managementTypes).toContain(
        PaymentMethodManagementTypeEnum.NOT_ONBOARDABLE
      );
      expect(managementTypes).toContain(
        PaymentMethodManagementTypeEnum.REDIRECT
      );
    });

    it("should have valid ranges", () => {
      paymentMethodsDB.forEach(paymentMethod => {
        expect(paymentMethod.ranges[0].min).toBe(0);
        expect(paymentMethod.ranges[0].max).toBeGreaterThanOrEqual(0);
        expect(paymentMethod.ranges[0].max).toBeLessThanOrEqual(5000);
      });
    });
  });

  describe("generateWalletDetailsByPaymentMethod", () => {
    it("should generate valid card details for payment method 1", () => {
      const result = generateWalletDetailsByPaymentMethod(1);
      expect(result.details.type).toBe("CARDS");
      if (isCardDetails(result.details)) {
        expect(result.details.lastFourDigits).toMatch(/^\d{4}$/);
        expect(result.details.expiryDate).toMatch(/^\d{6}$/);
        expect(result.details.brand).toBeDefined();
      }
      expect(result.paymentMethodAsset).toContain("carte-pagamento.png");
    });

    it("should generate valid PayPal details for payment method 2", () => {
      const result = generateWalletDetailsByPaymentMethod(2);
      expect(result.details.type).toBe("PAYPAL");
      if (isPayPalDetails(result.details)) {
        expect(result.details.maskedEmail).toContain("@");
        expect(result.details.pspBusinessName).toBe("Intesa Sanpaolo");
        expect(result.details.pspId).toBeDefined();
      }
      expect(result.paymentMethodAsset).toContain("paypal.png");
    });

    it("should generate valid BANCOMAT Pay details for payment method 3", () => {
      const result = generateWalletDetailsByPaymentMethod(3);
      expect(result.details.type).toBe("BPAY");
      if (isBpayDetails(result.details)) {
        expect(result.details.maskedNumber).toBeDefined();
        expect(result.details.instituteCode).toMatch(/^\d{5}$/);
        expect(result.details.bankName).toBeDefined();
      }
      expect(result.paymentMethodAsset).toContain("bancomat-pay.png");
    });

    it("should default to card details for invalid payment method id", () => {
      const result = generateWalletDetailsByPaymentMethod(999);
      expect(result.details.type).toBe("CARDS");
      if (isCardDetails(result.details)) {
        expect(result.details.lastFourDigits).toMatch(/^\d{4}$/);
        expect(result.details.expiryDate).toMatch(/^\d{6}$/);
        expect(result.details.brand).toBeDefined();
      }
    });

    it("should generate different details on multiple calls", () => {
      const result1 = generateWalletDetailsByPaymentMethod(1);
      const result2 = generateWalletDetailsByPaymentMethod(2);
      if (isCardDetails(result1.details) && isCardDetails(result2.details)) {
        expect(result1.details.lastFourDigits).not.toBe(
          result2.details.lastFourDigits
        );
        expect(result1.details.expiryDate).not.toBe(result2.details.expiryDate);
      }
    });
  });
});
