import { createStore } from "redux";
import { act, fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { PropsWithChildren, ReactElement } from "react";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { itwCredentialIssuanceMachine } from "../../../../machine/credential/machine";
import { ItwCredentialIssuanceMachineContext } from "../../../../machine/credential/provider";
import { ItwPresentationCredentialUnknownStatus } from "../ItwPresentationCredentialUnknownStatus";
import { StoredCredential } from "../../../../common/utils/itwTypesUtils";

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useRoute: jest.fn().mockReturnValue({ name: "DUMMY_ROUTE" }),
  useNavigation: () => ({
    setOptions: jest.fn(),
    goBack: jest.fn()
  })
}));

describe("ItwPresentationCredentialUnknownStatus", () => {
  const initialCredential = {
    credentialType: "mDL",
    storedStatusAssertion: {
      credentialStatus: "unknown"
    }
  } as StoredCredential;

  it("should match snapshot when the status assertion can be retried", () => {
    const component = renderComponent(
      <ItwPresentationCredentialUnknownStatus credential={initialCredential} />
    );
    expect(component).toMatchSnapshot();
  });

  it("should match snapshot when the status assertion is retried and is still unknown", () => {
    const component = renderComponent(
      <ItwPresentationCredentialUnknownStatus credential={initialCredential} />
    );

    act(() => {
      // Simulate status assertion retry
      fireEvent(component.getByTestId("RetryButtonTestID"), "onPress");
    });

    act(() => {
      component.rerender(
        <ItwPresentationCredentialUnknownStatus
          // Pass a new object to simulate the store update
          credential={
            {
              credentialType: "mDL",
              storedStatusAssertion: { credentialStatus: "unknown" }
            } as StoredCredential
          }
        />
      );
    });

    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (component: ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  const logic = itwCredentialIssuanceMachine.provide({
    actions: {
      onInit: jest.fn()
    }
  });

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <ItwCredentialIssuanceMachineContext.Provider logic={logic}>
        {children}
      </ItwCredentialIssuanceMachineContext.Provider>
    </Provider>
  );

  return render(component, { wrapper: Wrapper });
};
