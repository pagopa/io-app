import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { Alert } from "react-native";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import I18n from "../../../i18n";
import { PinCreation } from "../PinCreation/PinCreation";
import { PIN_LENGTH_SIX } from "../../../utils/constants";
import { defaultPin } from "../../../config";

const invalidPinCases: Array<Array<string>> = [
  Array.from({ length: PIN_LENGTH_SIX }, () => "1"),
  Array.from({ length: PIN_LENGTH_SIX }, (_, i) => String(i + 1)),
  Array.from({ length: PIN_LENGTH_SIX }, (_, i) => String(PIN_LENGTH_SIX - i))
];
const validPin = defaultPin.split("");

jest.spyOn(Alert, "alert");
const mockedGoBack = jest.fn();

jest.mock("react-native-safe-area-context", () => {
  const useSafeAreaInsets = () => ({ top: 0 });
  return {
    useSafeAreaInsets
  };
});
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useRoute: () => ({
      name: ""
    }),
    useNavigation: () => ({
      goBack: mockedGoBack,
      setOptions: jest.fn
    })
  };
});

describe(PinCreation, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should be not be null", () => {
    const component = render(renderComponent());

    expect(component).not.toBe(null);
  });
  it("Should properly render Carousel component", () => {
    const { getByTestId } = render(renderComponent());
    const carousel = getByTestId("pin-creation-carousel");
    const firstItem = getByTestId("create-pin-carousel-item");
    const firstItemTitle = getByTestId("create-pin-carousel-item_title");
    const firstItemDesc = getByTestId("create-pin-carousel-item_description");
    const secondItem = getByTestId("confirm-pin-carousel-item");
    const secondItemTitle = getByTestId("confirm-pin-carousel-item_title");

    expect(carousel).toBeDefined();
    expect(firstItem).toBeDefined();
    expect(firstItemTitle).toHaveTextContent(I18n.t("onboarding.pin.title"));
    expect(firstItemDesc).toHaveTextContent(I18n.t("onboarding.pin.subTitle"));
    expect(secondItem).toBeDefined();
    expect(secondItemTitle).toHaveTextContent(
      I18n.t("onboarding.pinConfirmation.title")
    );
  });
  invalidPinCases.forEach(pin => {
    it("Should display the alert when inserted pin is not valid", () => {
      const { getByText } = render(renderComponent());

      pin.forEach(input => {
        fireEvent.press(getByText(input));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        I18n.t("onboarding.pin.errors.invalid.title"),
        I18n.t("onboarding.pin.errors.invalid.description"),
        [
          {
            text: I18n.t("onboarding.pin.errors.invalid.cta")
          }
        ]
      );
    });
  });
  it("Should display the alerr when pin confirmation does not match", () => {
    const { getByText } = render(renderComponent());
    // Creation
    validPin.forEach(input => {
      fireEvent.press(getByText(input));
    });
    // Confirmation
    Array.from({ length: PIN_LENGTH_SIX }).forEach(() => {
      fireEvent.press(getByText("1"));
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("onboarding.pinConfirmation.errors.match.title"),
      undefined,
      [
        {
          text: I18n.t("onboarding.pinConfirmation.errors.match.cta"),
          onPress: expect.any(Function)
        }
      ]
    );
  });
});

function renderComponent(isOnboarding?: boolean) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  return (
    <Provider store={store}>
      <PinCreation isOnboarding={isOnboarding} />
    </Provider>
  );
}
