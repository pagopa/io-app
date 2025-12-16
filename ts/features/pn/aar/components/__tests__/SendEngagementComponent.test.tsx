import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { SendEngagementComponent } from "../SendEngagementComponent";
import { GlobalState } from "../../../../../store/reducers/types";
import * as urlUtils from "../../../../../utils/url";

const testPrivacyUrl = "https://a.privacy.url";
const testTOSUrl = "https://a.tos.url";

describe("SendEngagmentComponent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  [false, true].forEach(loading =>
    it(`should match snapshot when ${loading ? "" : "not "}loading`, () => {
      const component = renderComponent(
        loading,
        () => undefined,
        () => undefined
      );
      expect(component.toJSON()).toMatchSnapshot();
    })
  );
  [false, true].forEach(loading =>
    it(`should call input onClose method when the close header is pressed and is ${
      loading ? "" : "not "
    }loading`, () => {
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const closeIconButton = component.getByTestId("close-button");
      fireEvent.press(closeIconButton);

      expect(onClose.mock.calls.length).toBe(1);
      expect(onClose.mock.calls[0].length).toBe(0);
      expect(onPrimaryAction.mock.calls.length).toBe(0);
    })
  );
  [false, true].forEach(loading =>
    it(`should ${
      loading ? "" : "not "
    }call input onPrimaryAction method when the primary action is pressed while ${
      loading ? "" : "not "
    }loading`, () => {
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const primaryAction = component.getByTestId("primary-action");
      fireEvent.press(primaryAction);

      if (loading) {
        expect(onPrimaryAction.mock.calls.length).toBe(0);
      } else {
        expect(onPrimaryAction.mock.calls.length).toBe(1);
        expect(onPrimaryAction.mock.calls[0].length).toBe(1);
      }
      expect(onClose.mock.calls.length).toBe(0);
    })
  );
  [false, true].forEach(loading =>
    it(`should ${loading ? "" : "not "}navigate to the privacy url while ${
      loading ? "" : "not "
    }loading`, () => {
      const mockedSpiedOnOpenWebUrl = jest
        .spyOn(urlUtils, "openWebUrl")
        .mockImplementation();
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const privacyBodyLink = component.getByTestId("privacy-link");
      fireEvent.press(privacyBodyLink);

      if (loading) {
        expect(mockedSpiedOnOpenWebUrl.mock.calls.length).toBe(0);
      } else {
        expect(mockedSpiedOnOpenWebUrl.mock.calls.length).toBe(1);
        expect(mockedSpiedOnOpenWebUrl.mock.calls[0].length).toBe(1);
        expect(mockedSpiedOnOpenWebUrl.mock.calls[0][0]).toEqual(
          testPrivacyUrl
        );
      }

      expect(onPrimaryAction.mock.calls.length).toBe(0);
      expect(onClose.mock.calls.length).toBe(0);
    })
  );
  [false, true].forEach(loading =>
    it(`should ${loading ? "" : "not "}navigate to the tos url while ${
      loading ? "" : "not "
    }loading`, () => {
      const mockedSpiedOnOpenWebUrl = jest
        .spyOn(urlUtils, "openWebUrl")
        .mockImplementation();
      const onClose = jest.fn();
      const onPrimaryAction = jest.fn();

      const component = renderComponent(loading, onClose, onPrimaryAction);

      const tosBodyLink = component.getByTestId("tos-link");
      fireEvent.press(tosBodyLink);

      if (loading) {
        expect(mockedSpiedOnOpenWebUrl.mock.calls.length).toBe(0);
      } else {
        expect(mockedSpiedOnOpenWebUrl.mock.calls.length).toBe(1);
        expect(mockedSpiedOnOpenWebUrl.mock.calls[0].length).toBe(1);
        expect(mockedSpiedOnOpenWebUrl.mock.calls[0][0]).toEqual(testTOSUrl);
      }
      expect(onPrimaryAction.mock.calls.length).toBe(0);
      expect(onClose.mock.calls.length).toBe(0);
    })
  );
});

const renderComponent = (
  isLoading: boolean,
  onClose: () => void,
  onPrimaryAction: () => void
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const testState = {
    ...initialState,
    remoteConfig: O.some({
      cgn: {
        enabled: false
      },
      pn: {
        privacy_url: testPrivacyUrl,
        tos_url: testTOSUrl
      }
    })
  } as GlobalState;
  const store = createStore(appReducer, testState as any);
  return renderScreenWithNavigationStoreContext(
    () => (
      <SendEngagementComponent
        isLoading={isLoading}
        onClose={onClose}
        onPrimaryAction={onPrimaryAction}
      />
    ),
    PN_ROUTES.ENGAGEMENT_SCREEN,
    {},
    store
  );
};
