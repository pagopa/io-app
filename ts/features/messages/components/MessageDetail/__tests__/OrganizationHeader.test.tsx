import { act, fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import * as USE_IO_NAV from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SERVICES_ROUTES } from "../../../../services/common/navigation/routes";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { OrganizationHeader } from "../OrganizationHeader";

const mockMessageId = "01J3DE93YA7QYAD9WZQZCP98M6";
const mockServiceId = "01HXEPR9JD8838JZDN3YD0EF0Z" as ServiceId;
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
  [true, false].forEach(canNavigateToServiceDetails => {
    it(`should ${
      canNavigateToServiceDetails ? "" : "not "
    }navigate to service details on press when canNavigateToServiceDetails is ${canNavigateToServiceDetails}`, () => {
      const navigateMock = jest.fn();
      jest
        .spyOn(USE_IO_NAV, "useIONavigation")
        .mockReturnValueOnce({ navigate: navigateMock } as any);
      const { getByTestId } = renderComponent(
        mockDenomination,
        canNavigateToServiceDetails
      );
      const touchable = getByTestId("service-name");
      expect(touchable).toBeTruthy();
      act(() => {
        fireEvent.press(touchable);
      });
      if (canNavigateToServiceDetails) {
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith(
          SERVICES_ROUTES.SERVICES_NAVIGATOR,
          {
            screen: SERVICES_ROUTES.SERVICE_DETAIL,
            params: { serviceId: mockServiceId }
          }
        );
      } else {
        expect(navigateMock).not.toHaveBeenCalled();
      }
    });
  });
});

const renderComponent = (
  denomination: string | undefined = undefined,
  canNavigateToServiceDetails?: boolean | undefined
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <OrganizationHeader
        logoUri={require("../../../../../../img/test/logo.png")}
        messageId={mockMessageId}
        organizationName={"#### organization_name ####"}
        serviceName={"#### service name ####"}
        serviceId={mockServiceId}
        thirdPartySenderDenomination={denomination}
        canNavigateToServiceDetails={canNavigateToServiceDetails ?? true}
      />
    ),
    MESSAGES_ROUTES.MESSAGE_DETAIL,
    {},
    store
  );
};
