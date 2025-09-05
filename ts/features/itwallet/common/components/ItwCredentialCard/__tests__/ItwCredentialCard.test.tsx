import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { ItwCredentialStatus } from "../../../utils/itwTypesUtils";
import { ItwCredentialCard } from "../ItwCredentialCard";
import * as selectors from "../../../store/selectors";

describe("ItwCredentialCard", () => {
  it.each([
    "EuropeanHealthInsuranceCard",
    "EuropeanDisabilityCard",
    "mDL",
    "education_degree",
    "education_enrollment"
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
      .spyOn(selectors, "itwShouldRenderNewItWalletSelector")
      .mockReturnValue(true);

    const component = render(
      <Provider store={store}>
        <ItwCredentialCard credentialType="mDL" isItwCredential={false} />
      </Provider>
    );
    expect(component).toMatchSnapshot();
  });
});
