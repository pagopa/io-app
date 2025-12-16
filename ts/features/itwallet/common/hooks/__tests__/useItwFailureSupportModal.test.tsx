import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { render } from "@testing-library/react-native";
import { JSX } from "react";
import {
  useItwFailureSupportModal,
  ZendeskSubcategoryValue
} from "../useItwFailureSupportModal";
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
import { ItwFailure } from "../../utils/ItwFailureTypes.ts";
import { CredentialType } from "../../utils/itwMocksUtils.ts";

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  // Mock the bottom sheet to immediately render the component
  useIOBottomSheetModal: (params: { component: JSX.Element }) => ({
    bottomSheet: params.component
  })
}));

describe("useItwFailureSupportModal", () => {
  it("renders support chat when it is enabled", () => {
    const { queryByTestId } = renderHook({
      supportChatEnabled: true,
      zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      failure: {
        type: IssuanceFailureType.WALLET_PROVIDER_GENERIC,
        reason: {}
      } as IssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeTruthy();
    expect(queryByTestId("contact-method-mobile")).toBeNull();
    expect(queryByTestId("contact-method-landline")).toBeNull();
    expect(queryByTestId("contact-method-email")).toBeNull();
    expect(queryByTestId("contact-method-website")).toBeNull();
  });

  it("renders contact methods for MDL", () => {
    const { queryByTestId } = renderHook({
      supportChatEnabled: false,
      credentialType: CredentialType.DRIVING_LICENSE,
      zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      failure: {
        type: CredentialIssuanceFailureType.ISSUER_GENERIC,
        reason: {}
      } as CredentialIssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeNull();
    expect(queryByTestId("contact-method-mobile")).toBeTruthy();
    expect(queryByTestId("contact-method-landline")).toBeTruthy();
    expect(queryByTestId("contact-method-email")).toBeTruthy();
    expect(queryByTestId("contact-method-website")).toBeNull();
  });

  it("renders contact methods for EuropeanHealthInsuranceCard", () => {
    const { queryByTestId } = renderHook({
      supportChatEnabled: false,
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      failure: {
        type: CredentialIssuanceFailureType.ISSUER_GENERIC,
        reason: {}
      } as CredentialIssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeNull();
    expect(queryByTestId("contact-method-mobile")).toBeTruthy();
    expect(queryByTestId("contact-method-landline")).toBeNull();
    expect(queryByTestId("contact-method-email")).toBeNull();
    expect(queryByTestId("contact-method-website")).toBeNull();
  });

  it("renders contact methods for EuropeanDisabilityCard", () => {
    const { queryByTestId } = renderHook({
      supportChatEnabled: false,
      credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
      zendeskSubcategory: ZendeskSubcategoryValue.IT_WALLET_AGGIUNTA_DOCUMENTI,
      failure: {
        type: CredentialIssuanceFailureType.ISSUER_GENERIC,
        reason: {}
      } as CredentialIssuanceFailure
    });
    expect(queryByTestId("contact-method-chat")).toBeNull();
    expect(queryByTestId("contact-method-mobile")).toBeNull();
    expect(queryByTestId("contact-method-landline")).toBeNull();
    expect(queryByTestId("contact-method-email")).toBeNull();
    expect(queryByTestId("contact-method-website")).toBeTruthy();
  });
});

type Params = {
  failure: IssuanceFailure | CredentialIssuanceFailure | ItwFailure;
  credentialType?: string;
  supportChatEnabled: boolean;
  zendeskSubcategory: ZendeskSubcategoryValue;
};

const renderHook = (params: Params) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const Component = () => {
    const { bottomSheet } = useItwFailureSupportModal(params);
    return bottomSheet;
  };
  return render(
    <Provider store={mockStore(initialState)}>
      <Component />
    </Provider>
  );
};
