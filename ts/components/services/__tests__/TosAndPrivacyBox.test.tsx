import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import I18n from "../../../i18n";
import TosAndPrivacyBox from "../TosAndPrivacyBox";

const mockOnPress = jest.fn();

jest.mock("../../../utils/url", () => ({
  handleItemOnPress: jest.fn(_ => mockOnPress)
}));

const options = {
  tosUrl: "https://www.fsf.org/",
  privacyUrl: "https://gnupg.org/"
};

describe("TosAndPrivacyBox component", () => {
  beforeEach(() => mockOnPress.mockReset());

  describe("when both URLs are defined", () => {
    it("should match the snapshot", () => {
      const component = renderComponent(options);
      expect(component.toJSON()).toMatchSnapshot();
    });
    it("should call `handleItemOnPress` for TOS link", () => {
      const component = renderComponent(options);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const link = component
        .getAllByRole("link")
        .find(item => item.children[0] === I18n.t("services.tosLink"))!;
      fireEvent(link, "onPress");
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("should call `handleItemOnPress` for Privacy link", () => {
      const component = renderComponent(options);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const link = component
        .getAllByRole("link")
        .find(item => item.children[0] === I18n.t("services.privacyLink"))!;
      fireEvent(link, "onPress");
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("when either URL is not defined", () => {
    it("should not render TOS link", () => {
      expect(
        renderComponent({ ...options, tosUrl: undefined })
          .getAllByRole("link")
          .find(item => item.children[0] === I18n.t("services.tosLink"))
      ).toBeUndefined();
    });

    it("should not render Privacy link", () => {
      expect(
        renderComponent({ ...options, privacyUrl: undefined })
          .getAllByRole("link")
          .find(item => item.children[0] === I18n.t("services.privacyLink"))
      ).toBeUndefined();
    });
  });
});

function renderComponent({
  tosUrl,
  privacyUrl
}: Parameters<typeof TosAndPrivacyBox>[0]) {
  return render(<TosAndPrivacyBox tosUrl={tosUrl} privacyUrl={privacyUrl} />);
}
