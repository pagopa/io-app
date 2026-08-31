import { fireEvent } from "@testing-library/react-native";
import MockDate from "mockdate";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { LoginConfigScreen } from "../LoginConfigScreen";

const PIN_INPUT_LABEL = "Campo di inserimento per pin";

const MOCK_DATE = "2026-08-03";
const VALID_PIN = "260803";
const WRONG_PIN = "260804";

describe("LoginConfigScreen", () => {
  beforeEach(() => {
    MockDate.set(MOCK_DATE);
  });

  afterEach(() => {
    MockDate.reset();
  });

  it("should render the locked screen (PIN view)", () => {
    const { getByLabelText, queryByText } = renderComponent();

    const otpInput = getByLabelText(PIN_INPUT_LABEL);

    expect(otpInput).toBeDefined();
    expect(queryByText(/Login flow/i)).toBeNull();
  });

  it("should unlock and render LoginConfigScreenContent when a valid PIN is entered", () => {
    const { getByLabelText, queryByText } = renderComponent();

    const otpInput = getByLabelText(PIN_INPUT_LABEL);

    fireEvent.changeText(otpInput, VALID_PIN);

    expect(queryByText(/Login flow/i)).toBeTruthy();
  });

  it("should stay locked when a wrong PIN is entered", () => {
    const { getByLabelText, queryByText } = renderComponent();

    const otpInput = getByLabelText(PIN_INPUT_LABEL);

    fireEvent.changeText(otpInput, WRONG_PIN);

    expect(otpInput).toBeDefined();
    expect(queryByText(/Login flow/i)).toBeNull();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <LoginConfigScreen />,
    "DUMMY",
    {},
    store
  );
};
