const mockRequireNativeModule = jest.fn(() => ({}));

jest.mock("expo", () => ({ requireNativeModule: mockRequireNativeModule }));

const loadModuleOn = (os: string) => {
  jest.resetModules();
  jest.doMock("react-native", () => ({ Platform: { OS: os } }));
  return jest.requireActual("../ExpoHttpClientModule").default;
};

describe("ExpoHttpClientModule", () => {
  beforeEach(() => {
    mockRequireNativeModule.mockClear();
  });

  test.each(["ios", "android"])("is loaded on %s", os => {
    expect(loadModuleOn(os)).toBeDefined();
    expect(mockRequireNativeModule).toHaveBeenCalledWith("ExpoHttpClient");
  });

  test.each(["web", "windows"])("is not loaded on %s", os => {
    expect(loadModuleOn(os)).toBeUndefined();
    expect(mockRequireNativeModule).not.toHaveBeenCalled();
  });
});
