import { render } from "@testing-library/react-native";
import React from "react";
import I18n from "../../../../../../i18n";
import { mvlMock } from "../../../../types/__mock__/mvlMock";
import { MvlDetailsHeader } from "../MvlDetailsHeader";

describe("MvlDetailsHeader", () => {
  jest.useFakeTimers();
  describe("When the mvl has attachments", () => {
    it("Should be rendered the hasAttachments HeaderItem", () => {
      const component = renderComponent({
        message: mvlMock.message,
        hasAttachments: true
      });
      expect(
        component.queryByText(I18n.t("features.mvl.details.hasAttachments"))
      ).not.toBeNull();
    });

    it("Should be rendered the legalMessage HeaderItem", () => {
      const component = renderComponent({
        message: mvlMock.message,
        hasAttachments: true
      });
      expect(
        component.queryByText(I18n.t("features.mvl.title"))
      ).not.toBeNull();
    });
  });

  describe("When the mvl has no attachments", () => {
    it("Should not be rendered the hasAttachments HeaderItem", () => {
      const component = renderComponent({
        message: mvlMock.message,
        hasAttachments: false
      });
      expect(
        component.queryByText(I18n.t("features.mvl.details.hasAttachments"))
      ).toBeNull();
    });

    it("Should be rendered the legalMessage HeaderItem", () => {
      const component = renderComponent({
        message: mvlMock.message,
        hasAttachments: false
      });
      expect(
        component.queryByText(I18n.t("features.mvl.title"))
      ).not.toBeNull();
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MvlDetailsHeader>
) => render(<MvlDetailsHeader {...props} />);
