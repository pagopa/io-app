import configureMockStore from "redux-mock-store";
import * as React from "react";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { IDPayDetailsRoutes } from "../../navigation";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeSettingsComponent } from "../InitiativeSettingsComponent";

describe("InitiativeSettingsComponent component", () => {
  it.each<InitiativeStatusEnum>([
    InitiativeStatusEnum.NOT_REFUNDABLE,
    InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN,
    InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT,
    InitiativeStatusEnum.REFUNDABLE,
    InitiativeStatusEnum.SUSPENDED,
    InitiativeStatusEnum.UNSUBSCRIBED
  ])(`should match the snapshot with status %s`, status => {
    const component = renderComponent(status);
    expect(component).toMatchSnapshot();
  });
});

const mockInitiative: InitiativeDTO = {
  initiativeId: "initiativeId",
  initiativeName: "initiativeName",
  status: InitiativeStatusEnum.REFUNDABLE,
  nInstr: 3,
  iban: "IT91G77090083181073P819233K",
  endDate: new Date(2023, 1, 1)
};

const renderComponent = (status: InitiativeStatusEnum) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    globalState as GlobalState
  );

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => (
        <InitiativeSettingsComponent
          initiative={{ ...mockInitiative, status }}
        />
      ),
      IDPayDetailsRoutes.IDPAY_DETAILS_MAIN,
      {},
      store
    ),
    store
  };
};
