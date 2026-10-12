import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { ComponentProps } from "react";
import { Linking } from "react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SERVICES_ROUTES } from "../../navigation/routes";
import { ServiceContactField } from "../../utils/serviceContactMap";
import { ServiceContactListItem } from "../ServiceContactListItem";

const testID = "service-contact";

describe("ServiceContactListItem", () => {
  const openURL = jest.spyOn(Linking, "openURL");

  beforeEach(() => {
    openURL.mockReset();
    openURL.mockResolvedValue(undefined);
  });

  afterAll(() => {
    openURL.mockRestore();
  });

  it.each<{
    label: string;
    name: string;
    url: string;
    value: string;
    variant: ServiceContactField;
  }>([
    {
      name: "website",
      variant: "web_url",
      value: "https://example.com",
      label: I18n.t("services.contacts.website"),
      url: "https://example.com"
    },
    {
      name: "Android app",
      variant: "app_android",
      value: "https://example.com/android",
      label: I18n.t("services.contacts.downloadApp"),
      url: "https://example.com/android"
    },
    {
      name: "iOS app",
      variant: "app_ios",
      value: "https://example.com/ios",
      label: I18n.t("services.contacts.downloadApp"),
      url: "https://example.com/ios"
    },
    {
      name: "support",
      variant: "support_url",
      value: "https://example.com/support",
      label: I18n.t("services.contacts.support"),
      url: "https://example.com/support"
    },
    {
      name: "phone",
      variant: "phone",
      value: "+393331234567",
      label: I18n.t("services.contacts.phone"),
      url: "tel:+393331234567"
    },
    {
      name: "email",
      variant: "email",
      value: "test@example.com",
      label: I18n.t("services.contacts.email"),
      url: "mailto:test@example.com"
    },
    {
      name: "PEC",
      variant: "pec",
      value: "test@pec.example.com",
      label: I18n.t("services.contacts.pec"),
      url: "mailto:test@pec.example.com"
    }
  ])(
    "should render the $name contact and open $url on press",
    ({ label, url, value, variant }) => {
      const { getByTestId, getByText } = renderComponent({
        testID,
        value,
        variant
      });

      expect(getByText(label)).toBeTruthy();
      fireEvent.press(getByTestId(testID));
      expect(openURL).toHaveBeenCalledTimes(1);
      expect(openURL).toHaveBeenCalledWith(url);
    }
  );

  it.each([
    { name: "missing", value: undefined },
    { name: "empty", value: "" }
  ])("should render nothing when the value is $name", ({ value }) => {
    const { queryByTestId } = renderComponent({
      testID,
      value,
      variant: "phone"
    });

    expect(queryByTestId(testID)).toBeNull();
  });

  it("should call onPress with the value instead of opening the contact", () => {
    const onPress = jest.fn();
    const { getByTestId } = renderComponent({
      onPress,
      testID,
      value: "+393331234567",
      variant: "phone"
    });

    fireEvent.press(getByTestId(testID));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith("+393331234567");
    expect(openURL).not.toHaveBeenCalled();
  });
});

const renderComponent = (
  props: ComponentProps<typeof ServiceContactListItem>
) => {
  const state = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ServiceContactListItem {...props} />,
    SERVICES_ROUTES.SERVICE_DETAIL,
    {},
    createStore(appReducer, state as any)
  );
};
