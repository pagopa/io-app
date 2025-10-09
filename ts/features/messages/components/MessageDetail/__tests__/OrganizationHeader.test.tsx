import { createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { OrganizationHeader } from "../OrganizationHeader";

describe("OrganizationHeader component", () => {
  const mockDenomination = "#### sender denomination ####";
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should match the snapshot for a non third-party-denominated message", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match the snapshot for a TPM denominated message", () => {
    const component = renderComponent(mockDenomination);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should render an organization name under the testID "org-name"', () => {
    const component = renderComponent();
    const { getByTestId, queryByTestId } = component;
    expect(getByTestId("org-name")).toBeTruthy();
    expect(queryByTestId("org-name-aar")).not.toBeTruthy();
  });
  it('should render a third party denomination with testID "org-name-aar"', () => {
    const component = renderComponent(mockDenomination);
    const { getByTestId, queryByTestId } = component;
    expect(getByTestId("org-name-aar")).toBeTruthy();
    expect(queryByTestId("org-name")).not.toBeTruthy();
  });
});

const renderComponent = (denomination: string | undefined = undefined) => {
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
        thirdPartySenderDenomination={denomination}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
