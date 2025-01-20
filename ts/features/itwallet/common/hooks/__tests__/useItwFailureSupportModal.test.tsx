import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { ItwSupportModal } from "../useItwFailureSupportModal";
import {
  IssuanceFailure,
  IssuanceFailureType
} from "../../../machine/eid/failure";
import {
  CredentialIssuanceFailure,
  CredentialIssuanceFailureType
} from "../../../machine/credential/failure";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";

describe("useItwFailureSupportModal", () => {
  test.each([
    IssuanceFailureType.WALLET_PROVIDER_GENERIC,
    CredentialIssuanceFailureType.WALLET_PROVIDER_GENERIC
  ])("renders support chat when the error is %s", failureType => {
    const { queryByTestId } = renderHook({
      failure: {
        type: failureType,
        reason: {}
      } as CredentialIssuanceFailure
    });

    expect(queryByTestId("contact-method-chat")).toBeTruthy();
    expect(queryByTestId("contact-method-mobile")).toBeNull();
    expect(queryByTestId("contact-method-landline")).toBeNull();
    expect(queryByTestId("contact-method-email")).toBeNull();
  });

  it("renders all contact methods for MDL", () => {
    const { queryByTestId } = renderHook({
      credentialType: "MDL",
      failure: {
        type: CredentialIssuanceFailureType.ISSUER_GENERIC,
        reason: {}
      } as CredentialIssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeNull();
    expect(queryByTestId("contact-method-mobile")).toBeTruthy();
    expect(queryByTestId("contact-method-landline")).toBeTruthy();
    expect(queryByTestId("contact-method-email")).toBeTruthy();
  });

  test.each([
    IssuanceFailureType.NOT_MATCHING_IDENTITY,
    IssuanceFailureType.UNSUPPORTED_DEVICE,
    IssuanceFailureType.WALLET_REVOCATION_ERROR,
    IssuanceFailureType.ISSUER_GENERIC,
    CredentialIssuanceFailureType.ASYNC_ISSUANCE
  ])("does not render contact methods when the error is %s", failureType => {
    const { queryByTestId } = renderHook({
      failure: {
        type: failureType,
        reason: {}
      } as CredentialIssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeNull();
    expect(queryByTestId("contact-method-mobile")).toBeNull();
    expect(queryByTestId("contact-method-landline")).toBeNull();
    expect(queryByTestId("contact-method-email")).toBeNull();
  });
});

type Params = {
  failure: IssuanceFailure | CredentialIssuanceFailure;
  credentialType?: string;
};

const renderHook = (params: Params) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  return render(
    <Provider store={mockStore(initialState)}>
      <ItwSupportModal {...params} dismissModal={jest.fn()} />
    </Provider>
  );
};
