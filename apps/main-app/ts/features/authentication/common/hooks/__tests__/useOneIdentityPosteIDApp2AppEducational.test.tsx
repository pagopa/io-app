import { renderHook } from "@testing-library/react-native";

import { SpidIdp } from "../../../../../utils/idps";
import { useOneIdentityPosteIDApp2AppEducational } from "../useOneIdentityPosteIDApp2AppEducational";

const mockPresent = jest.fn();

jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetModal: jest.fn(() => ({
    present: mockPresent,
    bottomSheet: <></>
  }))
}));

const posteIdp = { id: "https://posteid.poste.it" } as SpidIdp;
const otherIdp = { id: "arubaid" } as SpidIdp;

describe("useOneIdentityPosteIDApp2AppEducational", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not present the bottom sheet until presentOnce is called", () => {
    renderHook(() => useOneIdentityPosteIDApp2AppEducational(posteIdp));

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet when presentOnce is called and idp is posteid", () => {
    const { result } = renderHook(() =>
      useOneIdentityPosteIDApp2AppEducational(posteIdp)
    );

    result.current.presentOnce();

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should not present the bottom sheet when idp is not posteid", () => {
    const { result } = renderHook(() =>
      useOneIdentityPosteIDApp2AppEducational(otherIdp)
    );

    result.current.presentOnce();

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet only once across multiple calls and re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useOneIdentityPosteIDApp2AppEducational(posteIdp)
    );

    result.current.presentOnce();
    rerender({});
    result.current.presentOnce();
    result.current.presentOnce();

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
