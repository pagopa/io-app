import { render } from "@testing-library/react-native";
import React from "react";
import { constNull } from "fp-ts/lib/function";
import { PayPalCheckoutPspComponent } from "../PayPalCheckoutPspComponent";
import { ImportoEuroCents } from "../../../../../../definitions/backend/ImportoEuroCents";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";
import I18n, { setLocale } from "../../../../../i18n";

const fee = 123 as ImportoEuroCents;

describe("PayPalCheckoutPspComponent", () => {
  beforeAll(() => {
    setLocale("it");
  });
  jest.useFakeTimers();
  it(`it should match the snapshot`, () => {
    const component = render(
      <PayPalCheckoutPspComponent
        onEditPress={constNull}
        fee={fee}
        pspName={"pspName"}
        privacyUrl={"https://io.italia.it"}
      />
    );
    expect(component).toMatchSnapshot();
  });

  describe("given a fee, pspName and privacy url", () => {
    it(`it should shown the data as expected`, () => {
      const pspName = "pspName123";
      const component = render(
        <PayPalCheckoutPspComponent
          onEditPress={constNull}
          fee={fee}
          pspName={pspName}
          privacyUrl={"https://io.italia.it"}
        />
      );
      expect(component).not.toBeNull();
      expect(
        component.queryByText(formatNumberCentsToAmount(fee, true))
      ).not.toBeNull();
      expect(
        component.queryByText(
          I18n.t("wallet.onboarding.paypal.paymentCheckout.pspHandler", {
            pspName
          })
        )
      ).not.toBeNull();
      expect(
        component.queryByText(
          I18n.t("wallet.onboarding.paypal.paymentCheckout.privacyTerms")
        )
      ).not.toBeNull();
    });
  });

  describe("given a fee, pspName and not privacy url", () => {
    it(`it should not shown the privacy link`, () => {
      const pspName = "pspName123";
      const component = render(
        <PayPalCheckoutPspComponent
          fee={fee}
          pspName={pspName}
          onEditPress={constNull}
        />
      );
      expect(component).not.toBeNull();
      expect(
        component.queryByText(formatNumberCentsToAmount(fee, true))
      ).not.toBeNull();
      expect(
        component.queryByText(
          I18n.t("wallet.onboarding.paypal.paymentCheckout.pspHandler", {
            pspName
          })
        )
      ).not.toBeNull();
      expect(
        component.queryByText(
          I18n.t("wallet.onboarding.paypal.paymentCheckout.privacyTerms")
        )
      ).toBeNull();
    });
  });
});
