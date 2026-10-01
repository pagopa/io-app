import { act, renderHook } from "@testing-library/react-native";

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

const renderEducationalHook = (idp: SpidIdp) =>
  renderHook(() => useOneIdentityPosteIDApp2AppEducational(idp));

describe("useOneIdentityPosteIDApp2AppEducational", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not present the bottom sheet until presentOnce is called", () => {
    renderEducationalHook(posteIdp);

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet when idp is posteid", () => {
    const { result } = renderEducationalHook(posteIdp);

    act(() => result.current.presentOnce());

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });

  it("should not present the bottom sheet when idp is not posteid", () => {
    const { result } = renderEducationalHook(otherIdp);

    act(() => result.current.presentOnce());

    expect(mockPresent).not.toHaveBeenCalled();
  });

  it("should present the bottom sheet only once across multiple calls and re-renders", () => {
    const { result, rerender } = renderEducationalHook(posteIdp);

    act(() => result.current.presentOnce());
    rerender({});
    act(() => result.current.presentOnce());
    act(() => result.current.presentOnce());

    expect(mockPresent).toHaveBeenCalledTimes(1);
  });
});
