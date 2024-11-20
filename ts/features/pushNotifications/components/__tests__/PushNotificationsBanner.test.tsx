import { fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { renderComponent } from "../../../../components/__tests__/ForceScrollDownView.test";
import * as UTILS from "../../utils";
import { PushNotificationsBanner } from "../PushNotificationsBanner";
import I18n from "../../../../i18n";

const testPressHandler = jest.fn();
jest
  .spyOn(UTILS, "openSystemNotificationSettingsScreen")
  .mockImplementation(testPressHandler);
describe("PushNotificationsBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const component = renderComponent(
      <PushNotificationsBanner closeHandler={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should call openSystemNotificationSettingsScreen on press", () => {
    const component = renderComponent(
      <PushNotificationsBanner closeHandler={jest.fn()} />
    );
    fireEvent(component.getByTestId("pushNotificationsBanner"), "press");
    expect(testPressHandler).toHaveBeenCalledTimes(1);
  });
  it("should correctly dispatch the closeHandler", () => {
    const testClose = jest.fn();
    const component = renderComponent(
      <PushNotificationsBanner closeHandler={testClose} />
    );
    fireEvent(
      component.getByA11yLabel(I18n.t("global.buttons.close")),
      "press"
    );
    expect(testClose).toHaveBeenCalledTimes(1);
  });
});
