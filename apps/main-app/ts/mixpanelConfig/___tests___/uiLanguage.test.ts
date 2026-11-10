import {
  updateMixpanelMessageLanguage,
  updateMixpanelUILanguage
} from "../uiLanguage";

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
      LANGUAGE_UI: "de"
    });
    expect(mockPeopleSet).toHaveBeenCalledWith({ PROFILE_LANGUAGE_UI: "de" });
  });

  it("updates the message language properties", () => {
    expect(updateMixpanelMessageLanguage("en")).toBe(true);

    expect(mockRegisterSuperProperties).toHaveBeenCalledWith({
      LANGUAGE_MESSAGE: "en"
    });
    expect(mockPeopleSet).toHaveBeenCalledWith({
      PROFILE_LANGUAGE_MESSAGE: "en"
    });
  });

  it("does not update properties when Mixpanel is not initialized", () => {
    mockIsMixpanelInitialized.mockReturnValue(false);

    expect(updateMixpanelUILanguage("de")).toBe(false);

    expect(mockRegisterSuperProperties).not.toHaveBeenCalled();
    expect(mockPeopleSet).not.toHaveBeenCalled();
  });

  it("does not update the message language when Mixpanel is not initialized", () => {
    mockIsMixpanelInitialized.mockReturnValue(false);

    expect(updateMixpanelMessageLanguage("en")).toBe(false);

    expect(mockRegisterSuperProperties).not.toHaveBeenCalled();
    expect(mockPeopleSet).not.toHaveBeenCalled();
  });
});
