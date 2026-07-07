import { createStore } from "redux";
import { ItwCredentialCard, ItwCredentialCardLegacy } from "..";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as credentials from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as credentialUtils from "../../../utils/itwCredentialUtils";
import { CredentialType } from "../../../utils/itwMocksUtils";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../utils/itwTypesUtils";

describe("ItwCredentialCard", () => {
  it.each([
    CredentialType.PID,
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD,
    CredentialType.PROOF_OF_AGE,
    CredentialType.EDUCATION_ATTENDANCE,
    CredentialType.EDUCATION_DEGREE,
    CredentialType.EDUCATION_DIPLOMA,
    CredentialType.EDUCATION_ENROLLMENT,
    CredentialType.RESIDENCY
  ])("should match snapshot when credential type is [%p]", type => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(false);

    const component = renderComponent(
      <ItwCredentialCard credentialType={type} />
    ).toJSON();

    expect(component).toMatchSnapshot();
  });

  it("should match snapshot when credential is pending upgrade", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(true);

    const component = renderComponent(
      <ItwCredentialCard credentialType={CredentialType.DRIVING_LICENSE} />
    );

    expect(component).toMatchSnapshot();
  });

  describe.each([
    "valid",
    "jwtExpired",
    "jwtExpiring"
  ] as ReadonlyArray<ItwJwtCredentialStatus>)(
    "should match snapshot when PID status is [%p]",
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

          const component = renderComponent(
            <ItwCredentialCard
              credentialType={CredentialType.DRIVING_LICENSE}
              credentialStatus={credentialStatus}
            />
          );

          expect(component).toMatchSnapshot();
        }
      );
    }
  );
});

describe("ItwCredentialCardLegacy", () => {
  it.each([
    CredentialType.DRIVING_LICENSE,
    CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
    CredentialType.EUROPEAN_DISABILITY_CARD
  ])("should match snapshot when credential type is [%p]", type => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(false);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(false);

    const component = renderComponent(
      <ItwCredentialCard credentialType={type} />
    );

    expect(component).toMatchSnapshot();
  });

  it("should match snapshot when credential is pending upgrade", () => {
    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);
    jest
      .spyOn(credentialUtils, "isCredentialIssuedBeforePid")
      .mockReturnValue(true);

    const component = renderComponent(
      <ItwCredentialCard credentialType={CredentialType.DRIVING_LICENSE} />
    );

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

          const component = renderComponent(
            <ItwCredentialCardLegacy
              credentialType={CredentialType.DRIVING_LICENSE}
              credentialStatus={credentialStatus}
            />
          );

          expect(component).toMatchSnapshot();
        }
      );
    }
  );
});

const renderComponent = (component: React.ReactElement) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => component,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
