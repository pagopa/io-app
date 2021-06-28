import React from "react";
import { render } from "@testing-library/react-native";

import I18n from "../../../../i18n";
import EmailSwitchRow from "../EmailSwitchRow";

describe("when is globally enabled", () => {
  describe("and the email was validated", () => {
    const options = {
      enabledGlobally: true,
      enabled: true,
      validated: true,
      locked: true
    };

    it("should show the correct info text", () => {
      const component = renderComponent(options);
      expect(component.getByTestId("EmailSwitchRow-info")).toHaveTextContent(
        I18n.t("serviceDetail.lockedMailAlert", {
          enabled: I18n.t("serviceDetail.enabled")
        })
      );
    });
    it("should show the correct link text", () => {
      const component = renderComponent(options);
      expect(
        component.getByTestId("EmailSwitchRow-info-link")
      ).toHaveTextContent(I18n.t("serviceDetail.updatePreferences"));
    });
    it("should be on", () => {
      const component = renderComponent(options);
      expect(component.getByTestId("EmailSwitchRow-switch").props.value).toBe(
        true
      );
    });
  });

  describe("and the email was not validated", () => {
    const options = {
      enabledGlobally: true,
      enabled: true,
      validated: false,
      locked: true
    };
    it("should show the correct info text", () => {
      const component = renderComponent(options);
      expect(component.getByTestId("EmailSwitchRow-info")).toHaveTextContent(
        I18n.t("serviceDetail.notValidated")
      );
    });
    it("should show the correct link text", () => {
      const component = renderComponent(options);
      expect(
        component.getByTestId("EmailSwitchRow-info-link")
      ).toHaveTextContent(I18n.t("serviceDetail.goTo"));
    });
    it("should be off", () => {
      const component = renderComponent(options);
      expect(component.getByTestId("EmailSwitchRow-switch").props.value).toBe(
        false
      );
    });
  });
});

function renderComponent(
  options: Partial<Parameters<typeof EmailSwitchRow>[0]>
) {
  return render(
    <EmailSwitchRow
      enabled={true}
      locked={true}
      validated={true}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onValueChange={() => {}}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      goToPreferences={() => {}}
      version={1}
      isUpdating={false}
      enabledGlobally={false}
      {...options}
    />
  );
}
