import { updateMixpanelUILanguage } from "../uiLanguage";

const mockIsMixpanelInitialized = jest.fn(() => true);
const mockRegisterSuperProperties = jest.fn();
const mockPeopleSet = jest.fn();

jest.mock("../../mixpanel", () => ({
  getPeople: () => ({ set: mockPeopleSet }),
  isMixpanelInstanceInitialized: () => mockIsMixpanelInitialized(),
  registerSuperProperties: (properties: unknown) =>
    mockRegisterSuperProperties(properties)
}));

describe("updateMixpanelUILanguage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsMixpanelInitialized.mockReturnValue(true);
  });

  it("updates the event and profile properties for the current UI language", () => {
    expect(updateMixpanelUILanguage("de")).toBe(true);

    expect(mockRegisterSuperProperties).toHaveBeenCalledWith({
      UI_LANGUAGE: "de"
    });
    expect(mockPeopleSet).toHaveBeenCalledWith({ UI_LANGUAGE: "de" });
  });

  it("does not update properties when Mixpanel is not initialized", () => {
    mockIsMixpanelInitialized.mockReturnValue(false);

    expect(updateMixpanelUILanguage("de")).toBe(false);

    expect(mockRegisterSuperProperties).not.toHaveBeenCalled();
    expect(mockPeopleSet).not.toHaveBeenCalled();
  });
});
