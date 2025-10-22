import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  ItwCredentialStatus,
  ItwJwtCredentialStatus
} from "../../../utils/itwTypesUtils";
import { ItwCredentialCard } from "../ItwCredentialCard";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as credentials from "../../../../credentials/store/selectors";

describe("ItwCredentialCard", () => {
  it.each([
    "EuropeanHealthInsuranceCard",
    "EuropeanDisabilityCard",
    "mDL",
    "education_degree",
    "education_enrollment",
    "residency"
  ])("should match snapshot when credential type is %p", type => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState
    } as GlobalState);

    const component = render(
      <Provider store={store}>
        <ItwCredentialCard credentialType={type} />
      </Provider>
    );

    expect(component).toMatchSnapshot();
  });

  it.each([
    "valid",
    "expired",
    "expiring",
    "pending",
    "unknown"
  ] as ReadonlyArray<ItwCredentialStatus>)(
    "should match snapshot when status is %p",
    status => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );

      const mockStore = configureMockStore<GlobalState>();
      const store: ReturnType<typeof mockStore> = mockStore({
        ...globalState
      } as GlobalState);

      const component = render(
        <Provider store={store}>
          <ItwCredentialCard credentialType={"mDL"} credentialStatus={status} />
        </Provider>
      );
      expect(component).toMatchSnapshot();
    }
  );

  it("should match snapshot when credential is pending upgrade", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const mockStore = configureMockStore<GlobalState>();
    const store: ReturnType<typeof mockStore> = mockStore({
      ...globalState
    } as GlobalState);

    jest
      .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
      .mockReturnValue(true);

    const component = render(
      <Provider store={store}>
        <ItwCredentialCard credentialType="mDL" isItwCredential={false} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });

  it.each([
    "jwtExpired",
    "jwtExpiring"
  ] as ReadonlyArray<ItwJwtCredentialStatus>)(
    "should match snapshot when eID is expired and credential is %p (credential status overridden to 'valid')",
    credentialStatus => {
      jest
        .spyOn(credentials, "itwCredentialsEidStatusSelector")
        .mockReturnValue("jwtExpired");

      const mockStore = configureMockStore<GlobalState>();
      const store = mockStore(
        appReducer(undefined, applicationChangeState("active")) as GlobalState
      );

      const component = render(
        <Provider store={store}>
          <ItwCredentialCard
            credentialType="mDL"
            credentialStatus={credentialStatus}
          />
        </Provider>
      );

      expect(component).toMatchSnapshot();
    }
  );

  it.each([
    "expired",
    "expiring",
    "invalid",
    "unknown"
  ] as ReadonlyArray<ItwCredentialStatus>)(
    "should match snapshot when eID is expired and credential is %p (credential status not overridden)",
    credentialStatus => {
      jest
        .spyOn(credentials, "itwCredentialsEidStatusSelector")
        .mockReturnValue("jwtExpired");

      const mockStore = configureMockStore<GlobalState>();
      const store = mockStore(
        appReducer(undefined, applicationChangeState("active")) as GlobalState
      );

      const component = render(
        <Provider store={store}>
          <ItwCredentialCard
            credentialType="mDL"
            credentialStatus={credentialStatus}
          />
        </Provider>
      );

      expect(component).toMatchSnapshot();
    }
  );
});
