import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { FimsFlowHandlerScreen } from "../FimsFlowHandlerScreen";
import { FIMS_ROUTES } from "../../../common/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import * as ANALYTICS from "../../../common/analytics";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { fimsGetConsentsListAction } from "../../store/actions";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import * as APPVERSION from "../../../../../utils/appVersion";

const ctaUrl = "https://relyingParty.url/login";
const label = "A label";
const organizationFiscalCode = "01234567891";
const organizationName = "Organization name";
const serviceId = "01JMFHJBNP8R55CJZX2G52Q1P2" as ServiceId;
const serviceName = "Service name";
const source = "MESSAGE_DETAIL";
const ephemeralSessionOniOS = true;

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("FimsFlowHandlerScreen", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  it("should call 'trackAuthenticationStart' and dispatch action upon first rendering", () => {
    jest.spyOn(APPVERSION, "getAppVersion").mockReturnValue("2.0.0.0");
    const spyOnTrackAuthenticationStart = jest.spyOn(
      ANALYTICS,
      "trackAuthenticationStart"
    );
    renderComponent("1.0.0.0");

    expect(spyOnTrackAuthenticationStart).toHaveBeenCalledWith(
      serviceId,
      serviceName,
      organizationName,
      organizationFiscalCode,
      label,
      source,
      ephemeralSessionOniOS
    );
    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(
      fimsGetConsentsListAction.request({
        ctaText: label,
        ctaUrl,
        ephemeralSessionOniOS
      })
    );
  });
  it("should call 'trackAuthenticationError' upon first rendering if an app update is required", () => {
    jest.spyOn(APPVERSION, "getAppVersion").mockReturnValue("2.0.0.0");
    const spyOnTrackAuthenticationError = jest.spyOn(
      ANALYTICS,
      "trackAuthenticationError"
    );
    renderComponent("0.0.0.0");

    expect(spyOnTrackAuthenticationError).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      undefined,
      "update_required"
    );
    expect(mockDispatch.mock.calls.length).toBe(0);
  });
});

const renderComponent = (minAppVersion: string) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const testState = {
    ...baseState,
    remoteConfig: O.some({
      assistanceTool: {
        tool: ToolEnum.none
      },
      cgn: {
        enabled: false
      },
      fims: {
        min_app_version: {
          android: minAppVersion,
          ios: minAppVersion
        }
      },
      itw: {
        min_app_version: {
          android: "0.0.0.0",
          ios: "0.0.0.0"
        }
      }
    })
  } as GlobalState;
  const store = createStore(appReducer, testState as any);
  return renderScreenWithNavigationStoreContext(
    FimsFlowHandlerScreen,
    FIMS_ROUTES.CONSENTS,
    {
      ctaText: label,
      ctaUrl,
      organizationFiscalCode,
      organizationName,
      serviceId,
      serviceName,
      source,
      ephemeralSessionOniOS
    },
    store
  );
};
