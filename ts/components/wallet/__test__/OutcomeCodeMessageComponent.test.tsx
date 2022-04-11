import * as React from "react";
import { View } from "react-native";
import configureMockStore from "redux-mock-store";
import { setLocale } from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { OutcomeCode } from "../../../types/outcomeCode";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import OutcomeCodeMessageComponent from "../OutcomeCodeMessageComponent";

const ASuccessComponent = () => <View testID="a-success-component" />;
const ASuccessFooter = () => <View testID="a-success-footer" />;
const onClose = jest.fn();

describe("OutcomeCodeMessageComponent", () => {
  jest.useFakeTimers();
  it("should be not null", () => {
    const outcomeCode = { status: "success" } as OutcomeCode;
    const component = renderComponent(outcomeCode, ASuccessComponent, onClose);

    expect(component).not.toBeNull();
  });
  it("should render ASuccessComponent if outcomeCode status is equal to success and prop successComponent has been passed", () => {
    const outcomeCode = { status: "success" } as OutcomeCode;
    const component = renderComponent(outcomeCode, ASuccessComponent, onClose);

    const successComponent = component.queryByTestId("a-success-component");
    expect(component).not.toBeNull();
    expect(successComponent).not.toBeNull();
  });
  it("should render ASuccessFooter if outcomeCode status is equal to success and prop successFooter has been passed", () => {
    const outcomeCode = { status: "success" } as OutcomeCode;
    const component = renderComponent(
      outcomeCode,
      ASuccessComponent,
      onClose,
      ASuccessFooter
    );

    const successFooter = component.queryByTestId("a-success-footer");
    expect(component).not.toBeNull();
    expect(successFooter).not.toBeNull();
  });
  it("should render InfoScreenComponent if outcomeCode status is not equal to success, outcomeCode title and description are defined and showing the right text", () => {
    const outcomeCode = {
      status: "errorTryAgain",
      title: {
        "en-EN": "title en",
        "it-IT": "title it"
      },
      description: {
        "en-EN": "description en",
        "it-IT": "description it"
      }
    } as OutcomeCode;
    setLocale("it");
    const component = renderComponent(outcomeCode, ASuccessComponent, onClose);

    expect(component).not.toBeNull();
    const titleComponent = component.queryByText("title it");
    expect(titleComponent).toBeTruthy();
    const descriptionComponent = component.queryByText("description it");
    expect(descriptionComponent).toBeTruthy();
    expect(component.queryByTestId("InfoScreenComponent")).not.toBeNull();
  });
  it("should render FooterWithButtons if outcomeCode status is equal to errorBlocking", () => {
    const outcomeCode = {
      status: "errorBlocking"
    } as OutcomeCode;
    const component = renderComponent(outcomeCode, ASuccessComponent, onClose);

    expect(component).not.toBeNull();
    expect(component.queryByTestId("FooterWithButtons")).not.toBeNull();
  });
});

const renderComponent = (
  outcomeCode: OutcomeCode,
  successComponent: React.FC,
  onClose: () => void,
  successFooter?: React.FC
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return renderScreenFakeNavRedux<GlobalState>(
    () => (
      <OutcomeCodeMessageComponent
        outcomeCode={outcomeCode}
        successComponent={successComponent}
        successFooter={successFooter}
        onClose={onClose}
      />
    ),
    ROUTES.ADD_CREDIT_CARD_OUTCOMECODE_MESSAGE,
    {},
    store
  );
};
