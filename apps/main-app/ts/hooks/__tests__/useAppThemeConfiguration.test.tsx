import { renderHook, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIOThemeContext } from "@pagopa/io-app-design-system";
import { setUserInterfaceStyle } from "@pagopa/io-react-native-zendesk";
import { Appearance, useColorScheme } from "react-native";
import { updateNavigationBarColor } from "../../features/settings/preferences/screens/AppearancePreferenceScreen";
import {
  THEME_PERSISTENCE_KEY,
  useAppThemeConfiguration
} from "../useAppThemeConfiguration";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn()
  }
}));

jest.mock("@pagopa/io-app-design-system", () => ({
  useIOThemeContext: jest.fn()
}));

jest.mock("@pagopa/io-react-native-zendesk", () => ({
  setUserInterfaceStyle: jest.fn()
}));

jest.mock(
  "../../features/settings/preferences/screens/AppearancePreferenceScreen",
  () => ({
    updateNavigationBarColor: jest.fn()
  })
);

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");

  return {
    ...actual,
    Appearance: {
      ...actual.Appearance,
      setColorScheme: actual.Appearance.setColorScheme
    },
    useColorScheme: jest.fn()
  };
});

const mockUseIOThemeContext = useIOThemeContext as jest.Mock;
const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockUseColorScheme = useColorScheme as jest.Mock;
const mockSetColorScheme = jest.spyOn(Appearance, "setColorScheme");
const mockSetUserInterfaceStyle = setUserInterfaceStyle as jest.Mock;
const mockUpdateNavigationBarColor = updateNavigationBarColor as jest.Mock;

describe("useAppThemeConfiguration", () => {
  const mockSetTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetColorScheme.mockImplementation(jest.fn());
    mockUseColorScheme.mockReturnValue("dark");
    mockUseIOThemeContext.mockReturnValue({
      setTheme: mockSetTheme,
      themeType: "dark"
    });
  });

  it("sets the persisted theme value when one is saved", async () => {
    mockGetItem.mockResolvedValueOnce("dark");

    renderHook(() => useAppThemeConfiguration());

    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith(THEME_PERSISTENCE_KEY);
      expect(mockSetColorScheme).toHaveBeenCalledWith("dark");
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
      expect(mockUpdateNavigationBarColor).toHaveBeenCalledWith("dark");
      expect(mockSetUserInterfaceStyle).toHaveBeenCalledWith("dark");
    });
  });

  it("sets the system color scheme when the persisted value is auto", async () => {
    mockGetItem.mockResolvedValueOnce("auto");

    renderHook(() => useAppThemeConfiguration());

    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith(THEME_PERSISTENCE_KEY);
      expect(mockSetColorScheme).toHaveBeenCalledWith(null);
      expect(mockSetTheme).toHaveBeenCalledWith("dark");
      expect(mockUpdateNavigationBarColor).toHaveBeenCalledWith("dark");
      expect(mockSetUserInterfaceStyle).toHaveBeenCalledWith("dark");
    });
  });

  it("falls back to light when the persisted value cannot be read", async () => {
    mockUseIOThemeContext.mockReturnValue({
      setTheme: mockSetTheme,
      themeType: "light"
    });
    mockGetItem.mockRejectedValueOnce(new Error("storage error"));

    renderHook(() => useAppThemeConfiguration());

    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith(THEME_PERSISTENCE_KEY);
      expect(mockSetColorScheme).toHaveBeenCalledWith("light");
      expect(mockSetTheme).toHaveBeenCalledWith("light");
      expect(mockUpdateNavigationBarColor).toHaveBeenCalledWith("light");
      expect(mockSetUserInterfaceStyle).toHaveBeenCalledWith("light");
    });
  });
});
