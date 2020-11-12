import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalConfigs } from "@gorhom/bottom-sheet/lib/typescript/types";
import * as React from "react";
import { AccessibilityContent } from "../components/bottomSheet/AccessibilityContent";
import { BlurredBackgroundComponent } from "../components/bottomSheet/BlurredBackgroundComponent";
import { BottomSheetContent } from "../components/bottomSheet/BottomSheetContent";
import { BottomSheetHeader } from "../components/bottomSheet/BottomSheetHeader";
import { isScreenReaderEnabled } from "./accessibility";

export type BottomSheetProps = {
  content: React.ReactNode;
  config: BottomSheetModalConfigs;
};

/**
 * Utility function to build a BottomSheet considering accessibility. This will create a common BottomSheet object to be used in the `present` function
 * that is available only in component context since it uses the context api made available from https://github.com/gorhom/react-native-bottom-sheet/blob/master/docs/modal.md#present
 * @param content
 * @param title
 * @param snapPoint
 * @param onClose
 * @param footer TODO: temp param
 */
export const bottomSheetContent = async (
  content: React.ReactNode,
  title: string,
  snapPoint: number,
  onClose: () => void
): Promise<BottomSheetProps> => {
  const isScreenReaderActive = await isScreenReaderEnabled();

  const header = BottomSheetHeader({ title, onClose });

  const bottomSheetBody: React.ReactNode = isScreenReaderActive
    ? AccessibilityContent(header, content)
    : BottomSheetContent({ children: content });

  return {
    content: bottomSheetBody,
    config: {
      snapPoints: [snapPoint],
      allowTouchThroughOverlay: false,
      dismissOnOverlayPress: true,
      dismissOnScrollDown: true,
      overlayComponent: () => BlurredBackgroundComponent(onClose),
      handleComponent: () => header
    }
  };
};

/**
 * Direct use of the bottomsheet in order to use a footer
 * @param content
 * @param title
 * @param snapPoint
 * @param onClose
 */
export const bottomSheetRawConfig = (
  content: React.ReactNode,
  title: string,
  snapPoint: number,
  onClose: () => void
): BottomSheetProps => ({
  content,
  config: {
    snapPoints: [snapPoint],
    allowTouchThroughOverlay: false,
    dismissOnOverlayPress: true,
    dismissOnScrollDown: true,
    overlayComponent: () => BlurredBackgroundComponent(onClose),
    handleComponent: () => BottomSheetHeader({ title, onClose })
  }
});

/**
 * Hook to use a modal
 * @param component
 * @param title
 * @param snapPoint
 */
export const useIOBottomSheet = (
  component: React.ReactNode,
  title: string,
  snapPoint: number
) => {
  const { present, dismiss } = useBottomSheetModal();

  const openModalBox = async () => {
    const bottomSheetProps = await bottomSheetContent(
      component,
      title,
      snapPoint,
      dismiss
    );
    present(bottomSheetProps.content, {
      ...bottomSheetProps.config
    });
  };
  return { present: openModalBox, dismiss };
};
