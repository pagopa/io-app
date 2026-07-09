import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as STORE_HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../utils/url";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { persistedDismissFseDiscoveryBanner } from "../../store/actions";
import { FseDiscoveryBanner } from "../FseDiscoveryBanner";

describe("FseDiscoveryBanner", () => {
  const webUrl = "https://example.com/fse";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should dispatch dismiss action and call close handler on close", () => {
    const handleOnClose = jest.fn();
    const dispatch = jest.fn();
    jest.spyOn(STORE_HOOKS, "useIODispatch").mockReturnValue(dispatch);

    const component = renderComponent(handleOnClose);
    fireEvent.press(component.getByLabelText(I18n.t("global.buttons.close")));

    expect(dispatch).toHaveBeenCalledWith(persistedDismissFseDiscoveryBanner());
    expect(handleOnClose).toHaveBeenCalledTimes(1);
  });

  it("should open the backend web url on press", () => {
    const openWebUrlSpy = jest
      .spyOn(URL_UTILS, "openWebUrl")
      .mockImplementation(() => undefined);

    const component = renderComponent(jest.fn(), { webUrl });
    fireEvent(component.getByTestId("fseDiscoveryBanner"), "onPress");

    expect(openWebUrlSpy).toHaveBeenCalledWith(webUrl);
  });

  it("should not render the close button when the backend flag is false", () => {
    const component = renderComponent(jest.fn(), { isDismissable: false });

    expect(
      component.queryByLabelText(I18n.t("global.buttons.close"))
    ).toBeNull();
  });

  it("should not open the backend web url when it is missing", () => {
    const openWebUrlSpy = jest
      .spyOn(URL_UTILS, "openWebUrl")
      .mockImplementation(() => undefined);
    const component = renderComponent(jest.fn(), { webUrl: undefined });
    fireEvent(component.getByTestId("fseDiscoveryBanner"), "onPress");

    expect(openWebUrlSpy).not.toHaveBeenCalled();
  });
});

const renderComponent = (
  handleOnClose: () => void,
  options: {
    isDismissable?: boolean;
    webUrl?: string;
  } = {}
) => {
  const { isDismissable = true } = options;
  const webUrl =
    "webUrl" in options ? options.webUrl : "https://example.com/fse";
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const remoteConfig = {
    ...baseRawBackendStatus.config,
    fse: {
      landingBanner: {
        ...(webUrl !== undefined ? { engagement_url: webUrl } : {}),
        is_dismissable: isDismissable
      }
    }
  };
  const store = createStore(appReducer, {
    ...initialState,
    remoteConfig: O.some(remoteConfig)
  } as any);

  return renderScreenWithNavigationStoreContext(
    () => <FseDiscoveryBanner handleOnClose={handleOnClose} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
