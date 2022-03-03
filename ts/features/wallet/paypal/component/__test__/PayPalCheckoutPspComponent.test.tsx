import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { constNull } from "fp-ts/lib/function";
import {
  editPspEnabled,
  PayPalCheckoutPspComponent
} from "../PayPalCheckoutPspComponent";
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

  it(`edit label should be always pressable`, () => {
    const pspName = "pspName123";
    const mockEditLabelOnPress = jest.fn();
    const component = render(
      <PayPalCheckoutPspComponent
        onEditPress={mockEditLabelOnPress}
        fee={fee}
        pspName={pspName}
        privacyUrl={"https://io.italia.it"}
      />
    );
    expect(component).not.toBeNull();
    if (editPspEnabled) {
      const editLabel = component.queryByText(
        I18n.t("global.buttons.edit").toUpperCase()
      );
      expect(editLabel).not.toBeNull();
      fireEvent(editLabel!, "onPress");
      expect(mockEditLabelOnPress).toHaveBeenCalledTimes(1);
    }
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
