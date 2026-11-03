import { render, waitFor } from "@testing-library/react-native";
import { ComponentType, PropsWithChildren } from "react";
import { Modal, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import * as accessibility from "../../accessibility";
import { useIOBottomSheetModal } from "../bottomSheet";

type MockBottomSheetModalProps = PropsWithChildren<{
  containerComponent?: ComponentType<PropsWithChildren>;
}>;

const mockBottomSheetModal = jest.fn(
  ({ children }: MockBottomSheetModalProps) => children
);

jest.mock("@gorhom/bottom-sheet", () => ({
  ...jest.requireActual("../../../__mocks__/@gorhom/bottom-sheet"),
  BottomSheetModal: (props: MockBottomSheetModalProps) =>
    mockBottomSheetModal(props)
}));

jest.mock("../../accessibility", () => ({
  ...jest.requireActual("../../accessibility"),
  isScreenReaderEnabled: jest.fn(),
  setAccessibilityFocus: jest.fn()
}));

describe(useIOBottomSheetModal, () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(accessibility.isScreenReaderEnabled).mockResolvedValue(false);
  });

  afterEach(() => jest.replaceProperty(Platform, "OS", originalPlatform));

  it("uses a transparent native modal as container on Android", async () => {
    jest.replaceProperty(Platform, "OS", "android");
    renderBottomSheet();

    await waitFor(() => expect(mockBottomSheetModal).toHaveBeenCalled());
    const { containerComponent: Container } =
      mockBottomSheetModal.mock.lastCall?.[0] ?? {};
    expect(Container).toBeDefined();
    if (!Container) {
      throw new Error("Android modal container is missing");
    }

    const { UNSAFE_getByType } = render(
      <Container>
        <View />
      </Container>
    );
    expect(UNSAFE_getByType(Modal).props.transparent).toBe(true);
  });

  it("does not set a native modal container on iOS", async () => {
    jest.replaceProperty(Platform, "OS", "ios");
    renderBottomSheet();

    await waitFor(() => expect(mockBottomSheetModal).toHaveBeenCalled());
    expect(mockBottomSheetModal.mock.lastCall?.[0].containerComponent).toBe(
      undefined
    );
  });

  it("preserves the existing Android fullscreen path", async () => {
    jest.replaceProperty(Platform, "OS", "android");
    renderBottomSheet(true);

    await waitFor(() => expect(mockBottomSheetModal).toHaveBeenCalled());
    expect(mockBottomSheetModal.mock.lastCall?.[0].containerComponent).toBe(
      undefined
    );
  });

  it("preserves the existing Android screen reader path", async () => {
    jest.replaceProperty(Platform, "OS", "android");
    jest.mocked(accessibility.isScreenReaderEnabled).mockResolvedValue(true);
    renderBottomSheet();

    await waitFor(() =>
      expect(mockBottomSheetModal.mock.lastCall?.[0].containerComponent).toBe(
        undefined
      )
    );
  });
});

const renderBottomSheet = (forceFullscreen = false) => {
  const Component = () => {
    const { bottomSheet } = useIOBottomSheetModal({
      component: <View />,
      forceFullscreen,
      title: "Title"
    });
    return bottomSheet;
  };

  return render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { height: 0, width: 0, x: 0, y: 0 },
        insets: { bottom: 0, left: 0, right: 0, top: 0 }
      }}
    >
      <Component />
    </SafeAreaProvider>
  );
};
