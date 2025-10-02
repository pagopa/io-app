import { createStore } from "redux";
import { OrganizationHeader } from "../OrganizationHeader";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as TPM from "../../../store/reducers/thirdPartyById";
import * as AAR_SELECTORS from "../../../../pn/aar/store/selectors";

describe("OrganizationHeader component", () => {
  const mockDenomination = "#### sender denomination ####";
  const isAArSpy = jest.spyOn(TPM, "isThirdParyMessageAarSelector");
  const denominationSpy = jest.spyOn(
    AAR_SELECTORS,
    "thirdPartySenderDenominationSelector"
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should match the snapshot for a non-aar message", () => {
    isAArSpy.mockReturnValue(false);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render an organization name under the testID "org-name"', () => {
    const component = renderComponent();
    isAArSpy.mockReturnValue(false);
    const { getByTestId, queryByTestId } = component;
    expect(getByTestId("org-name")).toBeTruthy();
    expect(queryByTestId("org-name-aar")).not.toBeTruthy();
  });
  it('should render the aar denomination with testID "org-name-aar"', () => {
    isAArSpy.mockReturnValue(true);
    denominationSpy.mockReturnValue(mockDenomination);

    const component = renderComponent();
    const { getByTestId, queryByTestId } = component;
    expect(getByTestId("org-name-aar")).toBeTruthy();
    expect(queryByTestId("org-name")).not.toBeTruthy();
  });
  it("should not render anything if rendered for an aar message with no retrievable sender denomination", () => {
    isAArSpy.mockReturnValue(true);
    denominationSpy.mockReturnValue(undefined);

    const { queryByTestId } = renderComponent();
    expect(queryByTestId("organization-header")).not.toBeTruthy();
  });
});

const renderComponent = () => {
  const messageId = "01J3DE93YA7QYAD9WZQZCP98M6";
  const serviceId = "01HXEPR9JD8838JZDN3YD0EF0Z" as ServiceId;
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <OrganizationHeader
        logoUri={require("../../../../../../img/test/logo.png")}
        messageId={messageId}
        organizationName={"#### organization_name ####"}
        serviceName={"#### service name ####"}
        serviceId={serviceId}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
