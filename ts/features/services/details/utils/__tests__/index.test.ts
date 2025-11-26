import { getServiceActionsProps } from "..";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { CTA, CTAS } from "../../../../../types/LocalizedCTAs";

const mockSpecialAction: IOScrollViewActions["primary"] = {
  label: "Special action",
  onPress: jest.fn()
};
const mockCta1: CTA = { text: "CTA 1", action: "" };
const mockCta2: CTA = { text: "CTA 2", action: "" };
const mockBothCTAs: CTAS = { cta_1: mockCta1, cta_2: mockCta2 };
const mockOnlyCTA1: CTAS = { cta_1: mockCta1 };

const mockPressCta = jest.fn();

describe("getServiceActionsProps", () => {
  it("returns ThreeButtons when Special Action, CTA 1 and CTA 2 are present", () => {
    const actions = getServiceActionsProps(
      mockSpecialAction,
      mockBothCTAs,
      mockPressCta
    );
    expect(actions).toBeDefined();
    expect(actions?.type).toBe("ThreeButtons");
    expect(actions?.primary).toEqual(mockSpecialAction);
    expect(actions?.secondary?.label).toBe(mockCta1.text);
    expect(actions?.tertiary?.label).toBe(mockCta2.text);
  });

  it("returns TwoButtons when Special Action and CTA 1 are present", () => {
    const actions = getServiceActionsProps(
      mockSpecialAction,
      mockOnlyCTA1,
      mockPressCta
    );
    expect(actions?.type).toBe("TwoButtons");
    expect(actions?.primary).toEqual(mockSpecialAction);
    expect(actions?.secondary?.label).toBe(mockCta1.text);
  });

  it("returns TwoButtons when CTA 1 and CTA 2 are present", () => {
    const actions = getServiceActionsProps(
      undefined,
      mockBothCTAs,
      mockPressCta
    );
    expect(actions?.type).toBe("TwoButtons");
    expect(actions?.primary?.label).toBe(mockCta1.text);
    expect(actions?.secondary?.label).toBe(mockCta2.text);
  });

  it("returns SingleButton when only Special Action is present", () => {
    const actions = getServiceActionsProps(
      mockSpecialAction,
      undefined,
      mockPressCta
    );
    expect(actions?.type).toBe("SingleButton");
    expect(actions?.primary).toEqual(mockSpecialAction);
  });

  it("returns SingleButton when only CTA 1 is present", () => {
    const actions = getServiceActionsProps(
      undefined,
      mockOnlyCTA1,
      mockPressCta
    );
    expect(actions?.type).toBe("SingleButton");
    expect(actions?.primary?.label).toBe(mockCta1.text);
  });

  it("returns undefined when no actions are present", () => {
    const actions = getServiceActionsProps(undefined, undefined, mockPressCta);
    expect(actions).toBeUndefined();
  });
});
