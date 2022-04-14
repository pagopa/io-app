import * as React from "react";
import { ComponentProps } from "react";
import { BottomSheetModal, useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Dimensions } from "react-native";
import { View } from "native-base";
import { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter";
import { BlurredBackgroundComponent } from "../../components/bottomSheet/BlurredBackgroundComponent";
import { BottomSheetContent } from "../../components/bottomSheet/BottomSheetContent";
import { BottomSheetHeader } from "../../components/bottomSheet/BottomSheetHeader";
import { useHardwareBackButtonToDismiss } from "../../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";

export type BottomSheetModalProps = {
  content: React.ReactNode;
  config: {
    snapPoints: ReadonlyArray<number>;
    backdropComponent: ComponentProps<
      typeof BottomSheetModal
    >["backdropComponent"];
    handleComponent: ComponentProps<typeof BottomSheetModal>["handleComponent"];
  };
};

/**
 * Utility function to build a BottomSheet considering accessibility. This will create a common BottomSheet object to be used in the `present` function
 * that is available only in component context since it uses the context api made available from https://gorhom.github.io/react-native-bottom-sheet/modal/methods
 * @param content
 * @param title
 * @param snapPoint
 * @param onClose
 */
export const bottomSheetContent = (
  content: React.ReactNode,
  title: string | React.ReactNode,
  snapPoint: number,
  onClose: () => void
): BottomSheetModalProps => {
  const header = <BottomSheetHeader title={title} onClose={onClose} />;

  const bottomSheetBody: React.ReactNode = (
    <BottomSheetContent>{content}</BottomSheetContent>
  );

  return {
    content: bottomSheetBody,
    config: {
      snapPoints: [Math.min(snapPoint, Dimensions.get("window").height)],
      backdropComponent: () => BlurredBackgroundComponent(onClose),
      handleComponent: () => header
    }
  };
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param component
 * @param title
 * @param snapPoint
 * @param footer
 */
export const useIOBottomSheet = (
  component: React.ReactNode,
  title: string | React.ReactNode,
  snapPoint: number,
  footer?: ComponentProps<typeof BottomSheetModal>["footerComponent"]
) => {
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const setBSOpened = useHardwareBackButtonToDismiss(dismissAll);

  const bottomSheetProps = bottomSheetContent(
    component,
    title,
    snapPoint,
    dismissAll
  );

  const present = () => {
    bottomSheetModalRef.current?.present();
    setBSOpened();
  };

  const bottomSheet = (
    <BottomSheetModal
      footerComponent={(props: BottomSheetFooterProps) =>
        footer !== undefined ? (
          <>
            {footer(props)}
            <View spacer />
          </>
        ) : null
      }
      snapPoints={[snapPoint]}
      ref={bottomSheetModalRef}
      handleComponent={bottomSheetProps.config.handleComponent}
      backdropComponent={bottomSheetProps.config.backdropComponent}
      enableDismissOnClose={true}
      accessible={false}
      // set this attribute to an empty string to avoid the default announcement from the library
      accessibilityPositionChangeAnnouncement={""}
      handleComponentAccessibility={{
        accessible: false
      }}
    >
      {bottomSheetProps.content}
    </BottomSheetModal>
  );
  return { present, dismiss: dismissAll, bottomSheet };
};
