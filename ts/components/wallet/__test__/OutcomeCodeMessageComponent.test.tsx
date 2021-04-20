import { View } from "native-base";
import * as React from "react";
import { NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { OutcomeCode } from "../../../types/outcomeCode";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import OutcomeCodeMessageComponent from "../OutcomeCodeMessageComponent";

const ASuccessComponent = () => <View testID="a-success-component"></View>;
const ASuccessFooter = () => <View testID="a-success-footer"></View>;
const onClose = jest.fn();

describe("OutcomeCodeMessageComponent", () => {
  beforeEach(() => jest.useFakeTimers());
  it("Rendering OutcomeCodeMessageComponent, all the required components should be defined", () => {
    const outcomeCode = { status: "success" } as OutcomeCode;
    const { component } = renderComponent(
      outcomeCode,
      ASuccessComponent,
      onClose
    );

    expect(component).not.toBeNull();
  });
  it("should render ASuccessFooter if outcomeCode status is equal to success and prop successFooter has been passed", () => {
    const outcomeCode = { status: "success" } as OutcomeCode;
    const { component } = renderComponent(
      outcomeCode,
      ASuccessComponent,
      onClose,
      ASuccessFooter
    );

    expect(component).not.toBeNull();
  });
  it("should render InfoScreenComponent if outcomeCode status is not equal to success and outcomeCode title is defined", () => {
    const outcomeCode = {
      status: "errorTryAgain",
      title: {
        "en-EN": "Test en",
        "it-IT": "Test it"
      }
    } as OutcomeCode;
    const { component } = renderComponent(
      outcomeCode,
      ASuccessComponent,
      onClose
    );

    expect(component).not.toBeNull();
    expect(component.queryByTestId("InfoScreenComponent")).not.toBeNull();
  });
  it("should render FooterWithButtons if outcomeCode status is equal to errorBlocking", () => {
    const outcomeCode = {
      status: "errorBlocking"
    } as OutcomeCode;
    const { component } = renderComponent(
      outcomeCode,
      ASuccessComponent,
      onClose
    );

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

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
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
    ),
    store
  };
};
