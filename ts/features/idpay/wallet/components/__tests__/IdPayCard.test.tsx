import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import { IdPayCard, IdPayCardProps } from "../IdPayCard";
import { appReducer } from "../../../../../store/reducers";

import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import { IDPayDetailsRoutes } from "../../../details/navigation";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";

const IDPAY_INITIATIVE_ID_MOCK = "1";
const IDPAY_INITIATIVE_NAME = "18 app";
const IDPAY_INITIATIVE_END_DATE_MOCK = new Date(2023, 11, 2);
const IDPAY_INITIATIVE_AMOUNT_CENTS_MOCK = 9999;

const idPayCardProps: IdPayCardProps = {
  name: IDPAY_INITIATIVE_NAME,
  amount: IDPAY_INITIATIVE_AMOUNT_CENTS_MOCK,
  avatarSource: {
    uri: "https://vtlogo.com/wp-content/uploads/2021/08/18app-vector-logo.png"
  },
  expireDate: new Date(2023, 11, 2)
};

const baseInitiativeCardDetails = {
  initiativeList: [
    {
      initiativeId: IDPAY_INITIATIVE_ID_MOCK,
      voucherEndDate: IDPAY_INITIATIVE_END_DATE_MOCK,
      nInstr: 1,
      status: StatusEnum.NOT_REFUNDABLE_ONLY_IBAN,
      initiativeName: IDPAY_INITIATIVE_NAME,
      amountCents: IDPAY_INITIATIVE_AMOUNT_CENTS_MOCK
    } as InitiativeDTO
  ]
} as WalletDTO;

describe("IdPayCard", () => {
  it("should match the snapshot", () => {
    const { component } = renderComponent(
      idPayCardProps,
      InitiativeRewardTypeEnum.REFUND
    );
    expect(component).toMatchSnapshot();
  });

  it("should hide total amount if reward type is EXPENSE", () => {
    const {
      component: { queryByTestId }
    } = renderComponent(idPayCardProps, InitiativeRewardTypeEnum.EXPENSE);
    expect(queryByTestId("idpay-card-amount")).toBeNull();
  });

  it("should show total amount if reward type is not EXPENSE", () => {
    const {
      component: { queryByTestId }
    } = renderComponent(idPayCardProps, InitiativeRewardTypeEnum.DISCOUNT);
    expect(queryByTestId("idpay-card-amount")).toHaveTextContent(
      formatNumberCentsToAmount(
        IDPAY_INITIATIVE_AMOUNT_CENTS_MOCK,
        true,
        "right"
      )
    );
  });
});

const renderComponent = (
  props: IdPayCardProps,
  rewardType: InitiativeRewardTypeEnum
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      idPay: {
        ...globalState.features.idPay,
        wallet: {
          ...globalState.features.idPay.wallet,
          initiatives: pot.some({
            initiativeList: baseInitiativeCardDetails.initiativeList.map(
              initiative => ({
                ...initiative,
                initiativeRewardType: rewardType
              })
            )
          })
        }
      }
    }
  } as GlobalState);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <IdPayCard {...props} />,
      IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
      {},
      store
    ),
    store
  };
};
