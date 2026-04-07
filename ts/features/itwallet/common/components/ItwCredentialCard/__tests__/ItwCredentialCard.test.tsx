import { createStore } from "redux";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as credentials from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as credentialUtils from "../../../utils/itwCredentialUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../utils/itwTypesUtils";
import { ItwCredentialCard } from "../ItwCredentialCard";

describe("ItwCredentialCard", () => {
  it.each([
    "EuropeanHealthInsuranceCard",
    "EuropeanDisabilityCard",
    "mDL",
    "education_degree",
    "education_enrollment",
    "residency"
  ])("should match snapshot when credential type is %p", type => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(false);

    const component = renderComponent({
      credentialType: type
    });

    expect(component).toMatchSnapshot();
  });

  it("should match snapshot when credential is pending upgrade", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(true);

    const component = renderComponent({
      credentialType: "mDL"
    });

    expect(component).toMatchSnapshot();
  });

  describe.each([
    "valid",
    "jwtExpired",
    "jwtExpiring"
  ] as ReadonlyArray<ItwJwtCredentialStatus>)(
    "should match snapshot when PID status is '%p'",
    pidStatus => {
      it.each([
        "jwtExpired",
        "jwtExpiring",
        "expired",
        "expiring",
        "valid",
        "invalid",
        "unknown"
      ] as ReadonlyArray<ItwCredentialStatus>)(
        "and credential status is '%p'",
        credentialStatus => {
          jest
            .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
            .mockReturnValue(false);
          jest
            .spyOn(credentials, "itwCredentialsEidStatusSelector")
            .mockReturnValue(pidStatus);
          jest
            .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
            .mockReturnValue(false);

          const component = renderComponent({
            credentialType: "mDL",
            credentialStatus
          });

          expect(component).toMatchSnapshot();
        }
      );
    }
  );
});

const renderComponent = (props: ItwCredentialCard) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <ItwCredentialCard {...props} />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
