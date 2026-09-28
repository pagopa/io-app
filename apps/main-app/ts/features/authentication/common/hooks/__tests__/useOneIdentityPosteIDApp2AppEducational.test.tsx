import { act, renderHook } from "@testing-library/react-native";

import { SpidIdp } from "../../../../../utils/idps";
import { useOneIdentityPosteIDApp2AppEducational } from "../useOneIdentityPosteIDApp2AppEducational";

const mockPresent = jest.fn();
const mockDismiss = jest.fn();

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: mockPresent,
    dismiss: mockDismiss,
    bottomSheet: <></>
  }))
}));

const posteIdp = { id: "https://posteid.poste.it" } as SpidIdp;
const otherIdp = { id: "arubaid" } as SpidIdp;

const renderEducationalHook = (idp: SpidIdp) =>
  renderHook(() => useOneIdentityPosteIDApp2AppEducational(idp));

describe("useOneIdentityPosteIDApp2AppEducational", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not present the bottom sheet until the WebView has loaded", () => {
    renderEducationalHook(posteIdp);

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet when the WebView loads and idp is posteid", () => {
    const { result } = renderEducationalHook(posteIdp);

    act(() => result.current.onWebViewLoad());

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should not present the bottom sheet when idp is not posteid", () => {
    const { result } = renderEducationalHook(otherIdp);

    act(() => result.current.onWebViewLoad());

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet only once across multiple loads and re-renders", () => {
    const { result, rerender } = renderEducationalHook(posteIdp);

    act(() => result.current.onWebViewLoad());
    rerender({});
    act(() => result.current.onWebViewLoad());
    act(() => result.current.onWebViewLoad());

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should not present the bottom sheet when the load fails in the same batch (Android onLoad + onError)", () => {
    const { result } = renderEducationalHook(posteIdp);

    act(() => {
      result.current.onWebViewLoad();
      result.current.onWebViewError();
    });

    expect(mockPresent).not.toHaveBeenCalled();
    expect(mockDismiss).not.toHaveBeenCalled();
  });

  it("should dismiss the bottom sheet when the load fails after it was presented", () => {
    const { result } = renderEducationalHook(posteIdp);

    act(() => result.current.onWebViewLoad());
    act(() => result.current.onWebViewError());

    expect(mockPresent).toHaveBeenCalledTimes(1);
    expect(mockDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not present the bottom sheet on a load following a failure", () => {
    const { result } = renderEducationalHook(posteIdp);

    act(() => result.current.onWebViewError());
    act(() => result.current.onWebViewLoad());

    expect(mockPresent).not.toHaveBeenCalled();
  });
});
