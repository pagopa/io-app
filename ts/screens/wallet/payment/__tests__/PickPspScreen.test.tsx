import { NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import PickPspScreen from "../PickPspScreen";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { Psp, Wallet } from "../../../../types/pagopa";
import ROUTES from "../../../../navigation/routes";

const rptId = {} as RptId;
const initialAmount = "300" as AmountInEuroCents;
const verifica = {} as PaymentRequestsGetResponse;
const idPayment = "123";
const psps = [
  {
    id: 0,
    fixedCost: { amount: 10 },
    logoPSP:
      "https://acardste.vaservices.eu:1443/pp-restapi/v1/resources/psp/43188"
  }
] as ReadonlyArray<Psp>;
const wallet = {
  idWallet: 38404
} as Wallet;

describe("Test PickPspScreen", () => {
  jest.useFakeTimers();

  it("rendering PickPspScreen, all the required components should be defined", () => {
    const { component } = renderComponent();

    expect(component.queryByTestId("PickPspScreen")).not.toBeNull();
  });
  it("should show the pspList if there is at least one psp", () => {
    const { component } = renderComponent();

    const pspList = component.queryByTestId("pspList");

    expect(pspList).not.toBeNull();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      PickPspScreen,
      ROUTES.PAYMENT_PICK_PSP,
      {
        rptId,
        initialAmount,
        verifica,
        idPayment,
        psps,
        wallet
      },
      store
    ),
    store
  };
};
