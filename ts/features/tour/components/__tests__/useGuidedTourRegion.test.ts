import { renderHook } from "@testing-library/react-native";

import { TourItemMeasurement } from "../../types";
import { useTourContext } from "../TourProvider";
import { useGuidedTourRegion } from "../useGuidedTourRegion";

jest.mock("../TourProvider", () => ({
  useTourContext: jest.fn()
}));

const mockUseTourContext = useTourContext as jest.Mock;

const makeRegionProvider = (): (() => TourItemMeasurement | undefined) =>
  jest.fn(() => ({ x: 0, y: 0, width: 100, height: 50 }));

describe("useGuidedTourRegion", () => {
  const mockRegisterRegion = jest.fn();
  const mockUnregisterRegion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTourContext.mockReturnValue({
      registerRegion: mockRegisterRegion,
      unregisterRegion: mockUnregisterRegion
    });
  });

  it("calls registerRegion on mount with correct arguments", () => {
    const region = makeRegionProvider();
    renderHook(() =>
      useGuidedTourRegion({
        groupId: "groupA",
        index: 0,
        title: "Step Title",
        description: "Step description",
        region
      })
    );

    expect(mockRegisterRegion).toHaveBeenCalledTimes(1);
    expect(mockRegisterRegion).toHaveBeenCalledWith(
      "groupA",
      0,
      region,
      expect.objectContaining({
        title: "Step Title",
        description: "Step description"
      })
    );
  });

  it("passes cutoutStyle to registerRegion when provided", () => {
    const region = makeRegionProvider();
    renderHook(() =>
      useGuidedTourRegion({
        groupId: "groupA",
        index: 1,
        title: "Title",
        description: "Desc",
        region,
        cutoutStyle: { cornerRadius: 12 }
      })
    );

    expect(mockRegisterRegion).toHaveBeenCalledWith(
      "groupA",
      1,
      region,
      expect.objectContaining({ cutoutStyle: { cornerRadius: 12 } })
    );
  });

  it("calls unregisterRegion on unmount with correct arguments", () => {
    const region = makeRegionProvider();
    const { unmount } = renderHook(() =>
      useGuidedTourRegion({
        groupId: "groupA",
        index: 2,
        title: "Title",
        description: "Desc",
        region
      })
    );

    expect(mockUnregisterRegion).not.toHaveBeenCalled();
    unmount();
    expect(mockUnregisterRegion).toHaveBeenCalledTimes(1);
    expect(mockUnregisterRegion).toHaveBeenCalledWith("groupA", 2);
  });

  it("re-registers when groupId changes", () => {
    const region = makeRegionProvider();
    const { rerender } = renderHook(
      ({ groupId }: { groupId: string }) =>
        useGuidedTourRegion({
          groupId,
          index: 0,
          title: "Title",
          description: "Desc",
          region
        }),
      { initialProps: { groupId: "groupA" } }
    );

    expect(mockRegisterRegion).toHaveBeenCalledTimes(1);

    rerender({ groupId: "groupB" });

    // unregister old, register new
    expect(mockUnregisterRegion).toHaveBeenCalledWith("groupA", 0);
    expect(mockRegisterRegion).toHaveBeenCalledTimes(2);
    expect(mockRegisterRegion).toHaveBeenLastCalledWith(
      "groupB",
      0,
      region,
      expect.any(Object)
    );
  });

  it("re-registers when index changes", () => {
    const region = makeRegionProvider();
    const { rerender } = renderHook(
      ({ index }: { index: number }) =>
        useGuidedTourRegion({
          groupId: "groupA",
          index,
          title: "Title",
          description: "Desc",
          region
        }),
      { initialProps: { index: 0 } }
    );

    rerender({ index: 1 });

    expect(mockUnregisterRegion).toHaveBeenCalledWith("groupA", 0);
    expect(mockRegisterRegion).toHaveBeenLastCalledWith(
      "groupA",
      1,
      region,
      expect.any(Object)
    );
  });
});
