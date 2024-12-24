import { createStore } from "redux";
import { OrganizationHeader } from "../OrganizationHeader";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { applicationChangeState } from "../../../../../store/actions/application";
import { UIMessageId } from "../../../types";

describe("OrganizationHeader component", () => {
  it("should match the snapshot", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
});

const renderComponent = () => {
  const messageId = "01J3DE93YA7QYAD9WZQZCP98M6" as UIMessageId;
  const serviceId = "01HXEPR9JD8838JZDN3YD0EF0Z" as ServiceId;
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

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
