import { renderHook, waitFor } from "@testing-library/react-native";
import * as O from "fp-ts/Option";
import { merge } from "lodash";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  ONE_IDENTITY_ENVS,
  OneIdentityEnv
} from "../../../../common/store/reducers/loginConfig";
import {
  createRetriableFetch,
  FetchResponse
} from "../../../../common/utils/fetch";
import { Idps } from "../../types/idps";
import { useGetIdps } from "../useGetIdps";

jest.mock("../../../../common/utils/fetch", () => {
  const mockFetch = jest.fn();

  return {
    ...jest.requireActual("../../../../common/utils/fetch"),
    createRetriableFetch: jest.fn(() => mockFetch)
  };
});

const mockRetriableFetch = createRetriableFetch() as jest.Mock;

const MOCK_IDPS_URL = "https://example.com/idps.json";
const MOCK_IDP_FRIENDLY_NAMES_URL = "https://example.com/idpFriendlyNames.json";

const mockIdps: Idps = [
  {
    entityID: "https://idp.oneid.pagopa.it",
    status: "OK",
    friendlyName: "Test IDP",
    active: true
  }
];

const mockIdpFriendlyNames: Record<string, string> = {
  "https://idp.oneid.pagopa.it": "Friendly Test IDP"
};

const mockFetchIdpsByUrl = (responses: Record<string, FetchResponse>) => {
  mockRetriableFetch.mockImplementation((url: string) =>
    Promise.resolve(responses[url])
  );
};

const successResponse = (status: number, body: unknown): FetchResponse => ({
  type: "success",
  response: {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body)
  } as unknown as Response
});

const networkFailureResponse = (message: string): FetchResponse => ({
  type: "failure",
  reason: "network-error",
  message
});

const renderUseGetIdpsHook = (
  oneIdentityEnv: OneIdentityEnv = ONE_IDENTITY_ENVS.PROD
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const state = merge(undefined, globalState, {
    features: {
      loginFeatures: {
        loginConfig: {
          oneIdentityEnv
        }
      }
    },
    remoteConfig: O.some({
      oneIdentity: {
        environments: {
          prod: {
            idpsUrl: MOCK_IDPS_URL,
            idpFriendlyNamesUrl: MOCK_IDP_FRIENDLY_NAMES_URL
          },
          uat: {
            idpsUrl: MOCK_IDPS_URL,
            idpFriendlyNamesUrl: MOCK_IDP_FRIENDLY_NAMES_URL
          }
        }
      }
    })
  } as GlobalState);

  const store = createStore(appReducer, state);

  return renderHook(() => useGetIdps(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
  });
};

describe("useGetIdps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize in loading state", () => {
    mockRetriableFetch.mockReturnValue(new Promise(() => {}));

    const { result } = renderUseGetIdpsHook();

    expect(result.current.state).toEqual({ status: "loading" });
  });

  it("should return a 'success' state with friendly names merged when both fetches succeed and comply with their schemas", async () => {
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: successResponse(200, mockIdps),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: successResponse(200, mockIdpFriendlyNames)
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect(result.current.state).toEqual({
      status: "success",
      data: [{ ...mockIdps[0], friendlyName: "Friendly Test IDP" }]
    });
  });

  it("should fall back to the idp's original friendlyName when it has no matching entry in idpFriendlyNames", async () => {
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: successResponse(200, mockIdps),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: successResponse(200, {
        "https://another-idp.oneid.pagopa.it": "Another IDP"
      })
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect(result.current.state).toEqual({
      status: "success",
      data: mockIdps
    });
  });

  it("should return a 'failure' state when the HTTP response status is not ok", async () => {
    mockRetriableFetch.mockResolvedValue(successResponse(500, {}));

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("failure");
    });

    expect(result.current.state).toEqual({
      status: "failure",
      error: "Unexpected HTTP status 500"
    });
  });

  it("should return a 'failure' state when the fetch fails with a network error", async () => {
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: networkFailureResponse("Network Error"),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: successResponse(200, mockIdpFriendlyNames)
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("failure");
    });

    expect(result.current.state).toEqual({
      status: "failure",
      error: "Network Error"
    });
  });

  it("should return a 'failure' state when the idps payload does NOT comply with IdpsSchema", async () => {
    const INVALID_PAYLOAD = { something: "completely-wrong" };
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: successResponse(200, INVALID_PAYLOAD),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: successResponse(200, mockIdpFriendlyNames)
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("failure");
    });

    expect(result.current.state).toEqual({
      status: "failure",
      error: expect.stringContaining("Invalid input")
    });
  });

  it("should return a 'success' state with the original friendlyName as a fallback when the idpFriendlyNames payload does NOT comply with IdpFriendlyNamesSchema", async () => {
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: successResponse(200, mockIdps),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: successResponse(200, [
        "not",
        "a",
        "record"
      ])
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect(result.current.state).toEqual({
      status: "success",
      data: mockIdps
    });
  });

  it("should return a 'success' state with the original friendlyName as a fallback when the idpFriendlyNames fetch fails with a network error", async () => {
    mockFetchIdpsByUrl({
      [MOCK_IDPS_URL]: successResponse(200, mockIdps),
      [MOCK_IDP_FRIENDLY_NAMES_URL]: networkFailureResponse("Network Error")
    });

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("success");
    });

    expect(result.current.state).toEqual({
      status: "success",
      data: mockIdps
    });
    expect(mockRetriableFetch).toHaveBeenCalledTimes(2);
  });
});
