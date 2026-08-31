import { renderHook, waitFor } from "@testing-library/react-native";
import * as O from "fp-ts/Option";
import { merge } from "lodash";
import { Provider } from "react-redux";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
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

const mockFetchIdps = createRetriableFetch() as jest.Mock;

const MOCK_URL = "https://example.com/idps.json";

const mockIdps: Idps = [
  {
    entityID: "https://idp.oneid.pagopa.it",
    status: "OK",
    friendlyName: "Test IDP",
    active: true
  }
];

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

const renderUseGetIdpsHook = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const state = merge(undefined, globalState, {
    remoteConfig: O.some({
      oneIdentity: {
        environments: {
          prod: { idpsUrl: MOCK_URL },
          uat: { idpsUrl: MOCK_URL }
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
    mockFetchIdps.mockReturnValue(new Promise(() => {}));

    const { result } = renderUseGetIdpsHook();

    expect(result.current.state).toEqual({ status: "loading" });
  });

  it("should return a 'success' state when the fetch succeeds and the payload matches the schema", async () => {
    mockFetchIdps.mockResolvedValue(successResponse(200, mockIdps));

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
    mockFetchIdps.mockResolvedValue(successResponse(500, {}));

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
    mockFetchIdps.mockResolvedValue(networkFailureResponse("Network Error"));

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("failure");
    });

    expect(result.current.state).toEqual({
      status: "failure",
      error: "Network Error"
    });
  });

  it("should return a 'failure' state when the payload does NOT comply with IdpsSchema", async () => {
    const INVALID_PAYLOAD = { something: "completely-wrong" };
    mockFetchIdps.mockResolvedValue(successResponse(200, INVALID_PAYLOAD));

    const { result } = renderUseGetIdpsHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe("failure");
    });

    expect(result.current.state).toEqual({
      status: "failure",
      error: expect.stringContaining("Invalid input")
    });
  });
});
