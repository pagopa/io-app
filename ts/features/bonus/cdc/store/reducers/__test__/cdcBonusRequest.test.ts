import { createStore } from "redux";
import {
  CdcBonusEnrollmentList,
  CdcBonusEnrollmentOutcomeList,
  CdcBonusRequest,
  CdcBonusRequestList,
  CdcBonusRequestResponse
} from "../../../types/CdcBonusRequest";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../bpd/model/RemoteValue";
import {
  cdcEnrollUserToBonus,
  cdcRequestBonusList,
  cdcSelectedBonus
} from "../../actions/cdcBonusRequest";
import { getTimeoutError } from "../../../../../../utils/errors";
import { StatoBeneficiarioEnum } from "../../../../../../../definitions/cdc/StatoBeneficiario";
import { Anno } from "../../../../../../../definitions/cdc/Anno";
import { EsitoRichiestaEnum } from "../../../../../../../definitions/cdc/EsitoRichiesta";

const mockBonusRequest: CdcBonusRequest = {
  status: StatoBeneficiarioEnum.ATTIVABILE,
  year: "2022" as Anno
};

const mockBonusRequestList: CdcBonusRequestList = [mockBonusRequest];

const mockEnrollRequestOutcome: CdcBonusEnrollmentOutcomeList = [
  { outcome: EsitoRichiestaEnum.CIT_REGISTRATO, year: "2022" as Anno },
  { outcome: EsitoRichiestaEnum.OK, year: "2021" as Anno }
];

const mockEnrollSuccessRequest: CdcBonusRequestResponse = {
  kind: "success",
  value: mockEnrollRequestOutcome
};

const genericError = getTimeoutError();

describe("CdcBonusRequestReducer", () => {
  it("The initial state should have both the bonusList and the enrolledBonus as remoteUndefined", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteUndefined,
      enrolledBonus: remoteUndefined
    });
  });
  it("The bonusList should be remoteLoading if the cdcRequestBonusList.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcRequestBonusList.request());
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteLoading,
      enrolledBonus: remoteUndefined
    });
  });
  it("The bonusList should be remoteReady with action payload as value if the cdcRequestBonusList.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcRequestBonusList.success(mockBonusRequestList));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteReady(mockBonusRequestList),
      enrolledBonus: remoteUndefined
    });
  });
  it("The bonusList should be remoteError with if the cdcRequestBonusList.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcRequestBonusList.failure(genericError));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteError(genericError),
      enrolledBonus: remoteUndefined
    });
  });
  it("The enrolledBonus should be remoteLoading and the bonusList remoteUndefined if the cdcEnrollUserToBonus.request is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const enrollUserPayload: CdcBonusEnrollmentList = [
      { year: "2022" as Anno }
    ];
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcRequestBonusList.success(mockBonusRequestList));
    store.dispatch(cdcEnrollUserToBonus.request(enrollUserPayload));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteUndefined,
      enrolledBonus: remoteLoading
    });
  });
  it("The enrolledBonus should be remoteReady with action payload as value if the cdcEnrollUserToBonus.success is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcEnrollUserToBonus.success(mockEnrollSuccessRequest));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteUndefined,
      enrolledBonus: remoteReady(mockEnrollSuccessRequest)
    });
  });
  it("The enrolledBonus should be remoteError with if the cdcEnrollUserToBonus.failure is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcEnrollUserToBonus.failure(genericError));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteUndefined,
      enrolledBonus: remoteError(genericError)
    });
  });
  it("The selectedBonus should be the action payload if the cdcSelectedBonus is dispatched", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(cdcSelectedBonus(mockBonusRequestList));
    expect(store.getState().bonus.cdc.bonusRequest).toEqual({
      bonusList: remoteUndefined,
      enrolledBonus: remoteUndefined,
      selectedBonus: mockBonusRequestList
    });
  });
});
