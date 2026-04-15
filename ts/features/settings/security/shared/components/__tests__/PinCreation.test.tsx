import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { Alert } from "react-native";
import I18n from "i18next";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { PinCreation } from "../../../shared/components/PinCreation";
import { PIN_LENGTH_SIX } from "../../../../../../utils/constants";
import { defaultPin } from "../../../../../../config";

const VALID_PIN = defaultPin.split("");
const REPEATED_NUMBERS = Array.from({ length: PIN_LENGTH_SIX }, () => "1");
const ASC_NUMBERS_SEQUENCE = Array.from({ length: PIN_LENGTH_SIX }, (_, i) =>
  String(i + 1)
);
const DESC_NUMBER_SEQUENCE = Array.from({ length: PIN_LENGTH_SIX }, (_, i) =>
  String(i + 1)
);

jest.mock("../../../../../../utils/hooks/usePreventScreenCapture", () => ({
  usePreventScreenCapture: jest.fn()
}));

const invalidPinCases = [
  REPEATED_NUMBERS,
  ASC_NUMBERS_SEQUENCE,
  DESC_NUMBER_SEQUENCE
];

jest.spyOn(Alert, "alert");
const mockGoBack = jest.fn();
const mockHandleSubmit = jest.fn();

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
      goBack: mockGoBack,
      setOptions: jest.fn
    })
  };
});
jest.mock("../../../hooks/useCreatePin", () => ({
  useCreatePin: () => ({
    handleSubmit: mockHandleSubmit
  })
}));

describe(PinCreation, () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should be not be null", () => {
    const component = render(renderComponent());

    expect(component).not.toBeNull();
  });
  it("Should properly render Carousel components", () => {
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
  it("Should display the alert when pin confirmation does not match to the pin created in the previous step", () => {
    const { getByText } = render(renderComponent());
    // Creation
    VALID_PIN.forEach(input => {
      fireEvent.press(getByText(input));
    });
    // Confirmation
    REPEATED_NUMBERS.forEach(input => {
      fireEvent.press(getByText(input));
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
  it("Should submit the pin without triggering the alerts", () => {
    const { getByText } = render(renderComponent());
    // Creation
    VALID_PIN.forEach(input => {
      fireEvent.press(getByText(input));
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    // Confirmation
    VALID_PIN.forEach(input => {
      fireEvent.press(getByText(input));
    });
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});

function renderComponent(isOnboarding?: boolean) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as unknown as PreloadedState<ReturnType<typeof appReducer>>
  );

  return (
    <Provider store={store}>
      <PinCreation isOnboarding={isOnboarding} />
    </Provider>
  );
}
