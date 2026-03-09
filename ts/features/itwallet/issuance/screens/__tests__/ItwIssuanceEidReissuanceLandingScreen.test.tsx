import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceEidReissuanceLandingScreen } from "../ItwIssuanceEidReissuanceLandingScreen";
import * as commonSelectors from "../../../common/store/selectors/preferences";
import * as credentialsSelectors from "../../../credentials/store/selectors";

describe("ItwIssuanceEidReissuanceLandingScreen", () => {
  it.each`
    isAnyWalletValid | isItWalletValid | canActivateItWallet | eidStatus
    ${true}          | ${false}        | ${true}             | ${"jwtExpiring"}
    ${true}          | ${false}        | ${true}             | ${"valid"}
    ${true}          | ${true}         | ${true}             | ${"jwtExpiring"}
    ${true}          | ${true}         | ${true}             | ${"valid"}
    ${false}         | ${false}        | ${true}             | ${undefined}
    ${false}         | ${false}        | ${false}            | ${undefined}
  `(
    "match snapshot for isAnyWalletValid=$isAnyWalletValid, isItWalletValid=$isItWalletValid, canActivateItWallet=$canActivateItWallet, eidStatus=$eidStatus ",
    ({ isAnyWalletValid, isItWalletValid, canActivateItWallet, eidStatus }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(isAnyWalletValid);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isItWalletValid);
      jest
        .spyOn(commonSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(canActivateItWallet);
      jest
        .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
        .mockReturnValue(eidStatus);

      const componentNoParams = renderComponent();
      expect(componentNoParams).toMatchSnapshot();
    }
  );
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceEidReissuanceLandingScreen,
    ITW_ROUTES.LANDING.EID_REISSUANCE,
    {},
    store
  );
};
