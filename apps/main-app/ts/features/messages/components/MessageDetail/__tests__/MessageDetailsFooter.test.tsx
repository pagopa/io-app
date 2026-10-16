import { ServiceMetadata } from "@io-app/api-types/generated/definitions/services/ServiceMetadata";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { ComponentProps, ReactNode } from "react";
import { Linking } from "react-native";
import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../utils/tests";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { messageId_1, service_1 } from "../../../__mocks__/messages";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { MessageDetailsFooter } from "../MessageDetailsFooter";

const mockPresentBottomSheet = jest.fn();
const mockShowBottomSheet = jest.fn(() => false);

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: ({ component }: { component: ReactNode }) => ({
    present: mockPresentBottomSheet,
    bottomSheet: mockShowBottomSheet() ? component : undefined
  })
}));

const defaultProps: ComponentProps<typeof MessageDetailsFooter> = {
  messageId: messageId_1,
  serviceId: service_1.id
};

const noticeNumber = "111122223333444455";
const payeeFiscalCode = "01234567890";

describe("MessageDetailsFooter component", () => {
  beforeEach(() => {
    mockPresentBottomSheet.mockReset();
    mockShowBottomSheet.mockReturnValue(false);
  });

  it("should match the snapshot, with service's contact details, no notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, with service's contact details, with notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, with service's contact details, no notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, with service's contact details, with notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, no notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, with notice number, no payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, no notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot, no service's contact details, with notice number, with payee fiscal code", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, {
      ...defaultProps,
      noticeNumber,
      payeeFiscalCode
    });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should call present function when the 'Show more data' action is pressed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success(service_1)
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);

    const showMoreDataAction = component.getByTestId("show-more-data-action");
    fireEvent.press(showMoreDataAction);
    expect(mockPresentBottomSheet).toHaveBeenCalledTimes(1);
  });

  it.each([
    {
      name: "website",
      metadata: { web_url: "https://example.com" },
      action: "contacts-web-url",
      url: "https://example.com"
    },
    {
      name: "support, as a website",
      metadata: { support_url: "https://example.com/support" },
      action: "contacts-web-url",
      url: "https://example.com/support"
    },
    {
      name: "support over website, as a website",
      metadata: {
        support_url: "https://example.com/support",
        web_url: "https://example.com"
      },
      action: "contacts-web-url",
      url: "https://example.com/support"
    },
    {
      name: "phone",
      metadata: { phone: "+393331234567" },
      action: "contacts-phone",
      url: "tel:+393331234567"
    },
    {
      name: "email",
      metadata: { email: "support@example.com" },
      action: "contacts-email",
      url: "mailto:support@example.com"
    },
    {
      name: "PEC",
      metadata: { pec: "support@pec.example.com" },
      action: "contacts-pec",
      url: "mailto:support@pec.example.com"
    }
  ])(
    "shows and opens $name when it is the only contact option",
    ({ metadata, action, url }) => {
      mockShowBottomSheet.mockReturnValue(true);
      const openURL = jest
        .spyOn(Linking, "openURL")
        .mockResolvedValue(undefined);
      const state = reproduceSequence({} as GlobalState, appReducer, [
        applicationChangeState("active"),
        loadServiceDetail.success({
          ...service_1,
          metadata: metadata as ServiceMetadata
        })
      ]);

      const { component } = renderComponent(state, defaultProps);
      fireEvent.press(component.getByTestId("contacts-action"));
      expect(mockPresentBottomSheet).toHaveBeenCalledTimes(1);
      fireEvent.press(component.getByTestId(action));
      expect(openURL).toHaveBeenCalledWith(url);
      openURL.mockRestore();
    }
  );

  it("shows the support link with the website label", () => {
    mockShowBottomSheet.mockReturnValue(true);
    const state = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          support_url: "https://example.com/support"
        } as ServiceMetadata
      })
    ]);

    const { component } = renderComponent(state, defaultProps);
    expect(
      component.getByText(I18n.t("services.contacts.website"))
    ).toBeTruthy();
    expect(
      component.queryByText(I18n.t("services.contacts.support"))
    ).toBeNull();
  });

  it("does not show contacts when the service has only app links", () => {
    const state = reproduceSequence({} as GlobalState, appReducer, [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          app_android: "https://example.com/android",
          app_ios: "https://example.com/ios"
        } as ServiceMetadata
      })
    ]);

    const { component } = renderComponent(state, defaultProps);
    expect(component.queryByTestId("contacts-action")).toBeNull();
  });

  it("should call present function when the 'Contacts' action is pressed", () => {
    const sequenceOfActions: ReadonlyArray<Action> = [
      applicationChangeState("active"),
      loadServiceDetail.success({
        ...service_1,
        metadata: {
          email: "test@test.com",
          phone: "+393331234567"
        } as ServiceMetadata
      })
    ];

    const state: GlobalState = reproduceSequence(
      {} as GlobalState,
      appReducer,
      sequenceOfActions
    );

    const { component } = renderComponent(state, defaultProps);

    const contactsAction = component.getByTestId("contacts-action");
    fireEvent.press(contactsAction);
    expect(mockPresentBottomSheet).toHaveBeenCalledTimes(1);
  });
});

const renderComponent = (
  state: GlobalState,
  props: ComponentProps<typeof MessageDetailsFooter>
) => {
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(state);

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      () => <MessageDetailsFooter {...props} />,
      MESSAGES_ROUTES.MESSAGE_DETAIL,
      {},
      store
    ),
    store
  };
};
