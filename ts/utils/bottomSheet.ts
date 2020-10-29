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
