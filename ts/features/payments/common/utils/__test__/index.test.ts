import { ListItemTransactionStatusWithBadge } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import {
  formatPaymentNoticeNumber,
  getAlertVariant,
  getBadgeTextByTransactionStatus,
  getPaymentLogoFromWalletDetails,
  getSortedPspList,
  getTransactionLogo,
  hasApplicationEnabled,
  hasPaymentFeature,
  isPaymentMethodExpired,
  isPaymentSupported,
  mapWalletIdToCardKey
} from "..";
import { LevelEnum } from "../../../../../../definitions/content/SectionStatus";
import { NoticeListItem } from "../../../../../../definitions/pagopa/biz-events/NoticeListItem";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletStatus";
import I18n from "../../../../../i18n";
import { UIWalletInfoDetails } from "../../types/UIWalletInfoDetails";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletApplicationStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";

describe("formatPaymentNoticeNumber", () => {
  it("should properly format a standard notice number", () => {
    const noticeNumber = "111122223333444455";
    const expectedFormattedNoticeNumber = "1111  2222  3333  4444  55";
    const formattedNoticeNumber = formatPaymentNoticeNumber(noticeNumber);
    expect(formattedNoticeNumber).toBe(expectedFormattedNoticeNumber);
  });
  it("should do nothing for an empty notice number", () => {
    const emptyNoticeNumber = "";
    const formattedNoticeNumber = formatPaymentNoticeNumber(emptyNoticeNumber);
    expect(formattedNoticeNumber).toBe(emptyNoticeNumber);
  });
  it("should do nothing for a non-numeric notice number", () => {
    const nonNumericNoticeNumber = "aaaabbbbccccddddee";
    const formattedNoticeNumber = formatPaymentNoticeNumber(
      nonNumericNoticeNumber
    );
    expect(formattedNoticeNumber).toBe(nonNumericNoticeNumber);
  });
  it("should do nothing for a notice number whith a content that is not groupable by four digits", () => {
    const nonGroupableNoticeNumber = "111a222b333d444d55";
    const formattedNoticeNumber = formatPaymentNoticeNumber(
      nonGroupableNoticeNumber
    );
    expect(formattedNoticeNumber).toBe(nonGroupableNoticeNumber);
  });
});

describe("getAlertVariant", () => {
  it("should return 'error' for LevelEnum.critical", () => {
    expect(getAlertVariant(LevelEnum.critical)).toBe("error");
  });
  it("should return 'info' for LevelEnum.normal", () => {
    expect(getAlertVariant(LevelEnum.normal)).toBe("info");
  });
  it("should return 'warning' for LevelEnum.warning", () => {
    expect(getAlertVariant(LevelEnum.warning)).toBe("warning");
  });
  it("should return 'info' for any other value", () => {
    expect(getAlertVariant("random" as LevelEnum)).toBe("info");
  });
});

describe("getBadgeTextByTransactionStatus", () => {
  it("should return the correct badge text for 'failure'", () => {
    expect(getBadgeTextByTransactionStatus("failure")).toBe(
      I18n.t("global.badges.failed")
    );
  });
  it("should return the correct badge text for 'cancelled'", () => {
    expect(getBadgeTextByTransactionStatus("cancelled")).toBe(
      I18n.t("global.badges.cancelled")
    );
  });
  it("should return the correct badge text for 'reversal'", () => {
    expect(getBadgeTextByTransactionStatus("reversal")).toBe(
      I18n.t("global.badges.reversal")
    );
  });
  it("should return the correct badge text for 'pending'", () => {
    expect(getBadgeTextByTransactionStatus("pending")).toBe(
      I18n.t("global.badges.onGoing")
    );
  });
  it("should return an empty string for an unknown status", () => {
    expect(
      getBadgeTextByTransactionStatus(
        "unknown" as ListItemTransactionStatusWithBadge
      )
    ).toBe("");
  });
});

describe("getSortedPspList", () => {
  const pspList: ReadonlyArray<Bundle> = [
    { pspBusinessName: "B", taxPayerFee: 2 },
    { pspBusinessName: "A", taxPayerFee: 1 },
    { pspBusinessName: "C", taxPayerFee: 3 }
  ] as ReadonlyArray<Bundle>;

  it("should sort by name", () => {
    const sortedList = getSortedPspList(pspList, "name");
    expect(sortedList[0].pspBusinessName).toBe("A");
    expect(sortedList[1].pspBusinessName).toBe("B");
    expect(sortedList[2].pspBusinessName).toBe("C");
  });

  it("should sort by amount", () => {
    const sortedList = getSortedPspList(pspList, "amount");
    expect(sortedList[0].taxPayerFee).toBe(1);
    expect(sortedList[1].taxPayerFee).toBe(2);
    expect(sortedList[2].taxPayerFee).toBe(3);
  });

  it("should return the default order", () => {
    const sortedList = getSortedPspList(pspList, "default");
    expect(sortedList[0].pspBusinessName).toBe("B");
    expect(sortedList[1].pspBusinessName).toBe("A");
    expect(sortedList[2].pspBusinessName).toBe("C");
  });
});

describe("getPaymentLogoFromWalletDetails", () => {
  it("should return 'payPal' if maskedEmail is provided", () => {
    const details: UIWalletInfoDetails = { maskedEmail: "test@example.com" };
    expect(getPaymentLogoFromWalletDetails(details)).toBe("payPal");
  });
  it("should return 'bancomatPay' if maskedNumber is provided", () => {
    const details: UIWalletInfoDetails = { maskedNumber: "1234567890" };
    expect(getPaymentLogoFromWalletDetails(details)).toBe("bancomatPay");
  });
  it("should return the correct logo based on brand", () => {
    const details: UIWalletInfoDetails = { brand: "VISA" };
    expect(getPaymentLogoFromWalletDetails(details)).toBe("visa");
  });
  it("should return undefined if no details are provided", () => {
    const details: UIWalletInfoDetails = {};
    expect(getPaymentLogoFromWalletDetails(details)).toBeUndefined();
  });
});

describe("getTransactionLogo", () => {
  it("should return the correct transaction logo URL", () => {
    const transaction = { payeeTaxCode: "00012345678" } as NoticeListItem;
    const logoUrl = getTransactionLogo(transaction);
    expect(O.isSome(logoUrl)).toBe(true);
    expect(pot.some(logoUrl).value).not.toBeUndefined();
  });
  it("should return none if payeeTaxCode is not provided", () => {
    const transaction = {} as NoticeListItem;
    const logoUrl = getTransactionLogo(transaction);
    expect(O.isNone(logoUrl)).toBe(true);
  });
});

describe("mapWalletIdToCardKey", () => {
  it("should return the correct card key", () => {
    const walletId = "wallet123";
    expect(mapWalletIdToCardKey(walletId)).toBe("method_wallet123");
  });
});

describe("isPaymentMethodExpired", () => {
  it("should return true if the payment method is expired", () => {
    const details: UIWalletInfoDetails = {
      expiryDate: "10001"
    };
    expect(isPaymentMethodExpired(details)).toBe(true);
  });
  it("should return false if the payment method is not expired", () => {
    const details: UIWalletInfoDetails = { expiryDate: "30001" };
    expect(isPaymentMethodExpired(details)).toBe(false);
  });
  it("should return false if expiry date is not provided", () => {
    const details: UIWalletInfoDetails = {};
    expect(isPaymentMethodExpired(details)).toBe(false);
  });
});

describe("hasApplicationEnabled", () => {
  const walletApplication = "PAGOPA";

  const walletObject: WalletInfo = {
    paymentMethodId: "pm_12345",
    status: WalletStatusEnum.VALIDATED,
    walletId: "wallet_12345",
    creationDate: new Date(),
    updateDate: new Date(),
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    clients: {},
    paymentMethodAsset: ""
  };

  it("should return true if the application is enabled", () => {
    expect(hasApplicationEnabled(walletObject, walletApplication)).toBe(true);
  });

  it("should return false if the application is disabled", () => {
    expect(
      hasApplicationEnabled(
        {
          ...walletObject,
          applications: [
            {
              name: "PAGOPA",
              status: WalletApplicationStatusEnum.DISABLED
            }
          ]
        },
        walletApplication
      )
    ).toBe(false);
  });

  it("should return false if payment method is undefined", () => {
    expect(hasApplicationEnabled(undefined, walletApplication)).toBe(false);
  });
});

describe("hasPaymentFeature", () => {
  const walletObject: WalletInfo = {
    paymentMethodId: "pm_12345",
    status: WalletStatusEnum.VALIDATED,
    walletId: "wallet_12345",
    creationDate: new Date(),
    updateDate: new Date(),
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    clients: {},
    paymentMethodAsset: ""
  };

  it("should return true if the payment method has the payment feature", () => {
    expect(hasPaymentFeature(walletObject)).toBe(true);
  });

  it("should return false if the payment method does not have the payment feature", () => {
    expect(
      hasPaymentFeature({
        ...walletObject,
        applications: [
          {
            name: "OTHER",
            status: WalletApplicationStatusEnum.ENABLED
          }
        ]
      })
    ).toBe(false);
  });
});

describe("isPaymentSupported", () => {
  const walletObject: WalletInfo = {
    paymentMethodId: "pm_12345",
    status: WalletStatusEnum.VALIDATED,
    walletId: "wallet_12345",
    creationDate: new Date(),
    updateDate: new Date(),
    applications: [
      {
        name: "PAGOPA",
        status: WalletApplicationStatusEnum.ENABLED
      }
    ],
    clients: {},
    paymentMethodAsset: ""
  };

  it("should return 'available' if the payment method has the payment feature", () => {
    expect(isPaymentSupported(walletObject)).toBe("available");
  });

  it("should return 'notAvailable' if the payment method does not have the payment feature", () => {
    expect(
      isPaymentSupported({
        ...walletObject,
        applications: [
          {
            name: "OTHER",
            status: WalletApplicationStatusEnum.ENABLED
          }
        ]
      })
    ).toBe("notAvailable");
  });
});
