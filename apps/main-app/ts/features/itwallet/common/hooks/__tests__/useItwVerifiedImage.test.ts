import { DeferredPromise } from "@pagopa/ts-commons/lib/promises";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Buffer } from "buffer";

import { fetchTimeout } from "../../../../../config";
import { useItwVerifiedImage } from "../useItwVerifiedImage";

const imageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const digest =
  "431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460";
const integrity = `sha-256-${digest}`;
const uri = "https://example.com/logo.png";
const verifiedUri = `data:image/png;base64,${imageBase64}`;
const response = {
  ok: true,
  headers: new Headers({ "content-type": "image/png" }),
  arrayBuffer: async () =>
    Uint8Array.from(Buffer.from(imageBase64, "base64")).buffer
} as Response;

const mockFetch = () =>
  jest.spyOn(globalThis, "fetch").mockResolvedValue(response);

describe("useItwVerifiedImage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("shows the verified bytes without a second download", async () => {
    const fetch = mockFetch();
    const pending = DeferredPromise<ArrayBuffer>();
    fetch.mockResolvedValueOnce({ ...response, arrayBuffer: () => pending.e1 });
    const { result } = renderHook(() => useItwVerifiedImage(uri, integrity));
    expect(result.current).toBeUndefined();

    await act(async () => pending.e2(await response.arrayBuffer()));

    expect(result.current).toBe(verifiedUri);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      uri,
      expect.objectContaining({ signal: expect.anything() })
    );
  });

  it.each([
    { name: "missing URI", source: undefined, hash: integrity },
    { name: "missing integrity", source: uri, hash: undefined },
    { name: "malformed digest", source: uri, hash: "sha-256-invalid" },
    { name: "unsupported algorithm", source: uri, hash: `sha-512-${digest}` }
  ])("does not download an image with $name", ({ source, hash }) => {
    const fetch = mockFetch();
    const { result } = renderHook(() => useItwVerifiedImage(source, hash));
    expect(result.current).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts uppercase hexadecimal hashes", async () => {
    mockFetch();
    const { result } = renderHook(() =>
      useItwVerifiedImage(uri, `sha-256-${digest.toUpperCase()}`)
    );
    await waitFor(() => expect(result.current).toBe(verifiedUri));
  });

  it.each([
    {
      name: "modified bytes",
      download: async () => ({
        ...response,
        arrayBuffer: async () => new ArrayBuffer(0)
      })
    },
    {
      name: "an HTTP error",
      download: async () => ({ ...response, ok: false })
    },
    {
      name: "a network error",
      download: async () => {
        throw new Error("network failed");
      }
    }
  ])("does not show an image after $name", async ({ download }) => {
    const fetch = mockFetch().mockImplementation(download);
    const { result } = renderHook(() => useItwVerifiedImage(uri, integrity));
    await act(async () => {
      await fetch.mock.results[0].value.catch(() => undefined);
    });
    expect(result.current).toBeUndefined();
  });

  it("aborts the download on unmount", () => {
    const fetch = mockFetch().mockReturnValue(DeferredPromise<Response>().e1);
    const { unmount } = renderHook(() => useItwVerifiedImage(uri, integrity));
    const signal = fetch.mock.calls[0][1]?.signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it("aborts the download on timeout", () => {
    jest.useFakeTimers();
    const fetch = mockFetch().mockReturnValue(DeferredPromise<Response>().e1);
    renderHook(() => useItwVerifiedImage(uri, integrity));
    act(() => jest.advanceTimersByTime(fetchTimeout));
    expect(fetch.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("ignores stale bytes after the expected hash changes", async () => {
    const pending = DeferredPromise<ArrayBuffer>();
    mockFetch().mockResolvedValueOnce({
      ...response,
      arrayBuffer: () => pending.e1
    });
    const { result, rerender } = renderHook(
      ({ hash }: { hash: string }) => useItwVerifiedImage(uri, hash),
      { initialProps: { hash: integrity } }
    );
    rerender({ hash: `sha-256-${"0".repeat(64)}` });
    await act(async () => pending.e2(await response.arrayBuffer()));
    expect(result.current).toBeUndefined();
  });
});
