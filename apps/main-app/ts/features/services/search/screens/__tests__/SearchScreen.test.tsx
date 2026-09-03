import { IOThemeContextProvider } from "@io-app/design-system";
import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Keyboard } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SearchScreen } from "../SearchScreen";

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useFocusEffect: jest.fn()
}));

jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    addListener: jest.fn(() => jest.fn()),
    goBack: mockGoBack
  })
}));

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch
}));

jest.mock("../../hooks/useInstitutionsFetcher", () => ({
  useInstitutionsFetcher: () => ({
    data: undefined,
    fetchNextPage: jest.fn(),
    isError: false,
    isLoading: false,
    isUpdating: false,
    refresh: jest.fn()
  })
}));

describe("SearchScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dismisses the keyboard before going back when search is cancelled", () => {
    const dismissKeyboard = jest.spyOn(Keyboard, "dismiss");
    const { getByLabelText } = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 640, width: 320, x: 0, y: 0 },
          insets: { bottom: 0, left: 0, right: 0, top: 0 }
        }}
      >
        <IOThemeContextProvider theme="light">
          <SearchScreen />
        </IOThemeContextProvider>
      </SafeAreaProvider>
    );

    expect(dismissKeyboard).toHaveBeenCalledTimes(0);
    expect(mockGoBack).toHaveBeenCalledTimes(0);

    const btn = getByLabelText(I18n.t("services.search.input.cancel"));
    fireEvent.press(btn);

    expect(dismissKeyboard).toHaveBeenCalledTimes(1);
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    const keyboardDismissCallOrder =
      dismissKeyboard.mock.invocationCallOrder[0];
    const goBackCallOrder = mockGoBack.mock.invocationCallOrder[0];
    expect(keyboardDismissCallOrder).toBeLessThan(goBackCallOrder);
  });
});
