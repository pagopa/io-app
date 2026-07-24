import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";

import { openWebUrl } from "../../../../../../utils/url";
import { CgnMerchantCategoriesSocialLinks } from "../CgnMerchantCategoriesSocialLinks";

jest.mock("../../../../../../utils/url", () => ({
  openWebUrl: jest.fn()
}));

describe("CgnMerchantCategoriesSocialLinks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders social links", () => {
    const { getByTestId, getByText } = render(
      <CgnMerchantCategoriesSocialLinks />
    );

    expect(getByTestId("CgnMerchantCategoriesSocialLinks")).toBeTruthy();
    expect(
      getByText(
        I18n.t("bonus.cgn.merchantsList.categoriesList.socialLinks.instagram")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("bonus.cgn.merchantsList.categoriesList.socialLinks.facebook")
      )
    ).toBeTruthy();
    expect(
      getByText(
        I18n.t("bonus.cgn.merchantsList.categoriesList.socialLinks.linkedin")
      )
    ).toBeTruthy();
  });

  it("opens social links when pressed", () => {
    const { getByTestId } = render(<CgnMerchantCategoriesSocialLinks />);

    fireEvent.press(getByTestId("cgn-social-link-instagram"));

    expect(openWebUrl).toHaveBeenCalledWith(
      "https://www.instagram.com/ioitaliait/"
    );
  });
});
