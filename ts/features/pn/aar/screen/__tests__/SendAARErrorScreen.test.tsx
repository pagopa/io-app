import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as ERROR_COMPONENT from "../../components/errors/SendAARErrorComponent";
import * as NOT_ADDRESSEE_COMPONENT from "../../components/errors/SendAARNotAddresseeComponent";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARErrorScreen } from "../SendAARErrorScreen";

jest.mock("../../components/errors/SendAARNotAddresseeComponent.tsx");
jest.mock("../../components/errors/SendAARErrorComponent.tsx");
jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIOSelector: jest.fn()
}));

describe("SendAARErrorScreen", () => {
  const componentMock = jest.fn();
  const notAddresseeComponentSpy = jest
    .spyOn(NOT_ADDRESSEE_COMPONENT, "SendAARNotAddresseeComponent")
    .mockImplementation(componentMock);
  const errorComponentSpy = jest
    .spyOn(ERROR_COMPONENT, "SendAARErrorComponent")
    .mockImplementation(componentMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the SendAARErrorComponent if flowType==='notAddresseeFinal'", () => {
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(
      sendAARFlowStates.notAddresseeFinal
    );
    expect(notAddresseeComponentSpy).not.toHaveBeenCalled();
    renderScreen();
    expect(notAddresseeComponentSpy).toHaveBeenCalled();
  });
  it("should render the SendAARErrorComponent if flowType!=='notAddresseeFinal'", () => {
    (HOOKS.useIOSelector as jest.Mock).mockReturnValue(sendAARFlowStates.ko);
    expect(errorComponentSpy).not.toHaveBeenCalled();
    renderScreen();
    expect(errorComponentSpy).toHaveBeenCalled();
  });
});

const renderScreen = () => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState
  } as GlobalState;
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARErrorScreen />,
    PN_ROUTES.SEND_AAR_ERROR,
    {},
    createStore(appReducer, globalState as any)
  );
};
