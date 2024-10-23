import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import {
  IOBottomSheetHeaderRadius,
  IOColors,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetHeader } from "../../components/bottomSheet/BottomSheetHeader";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { useHardwareBackButtonToDismiss } from "../../hooks/useHardwareBackButton";
import { isScreenReaderEnabled } from "../accessibility";

const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  bottomSheet: {
    borderTopRightRadius: IOBottomSheetHeaderRadius,
    borderTopLeftRadius: IOBottomSheetHeaderRadius,
    borderCurve: "continuous",
    // Don't delete the overflow property
    // oterwise the above borderRadius won't work
    overflow: "hidden"
  }
});

export type BottomSheetModalProps = {
  content: React.ReactNode;
  config: {
    handleComponent: React.ReactElement;
  };
};

export type IOBottomSheetModal = {
  present: () => void;
  dismiss: () => void;
  bottomSheet: JSX.Element;
};

/**
 * @typedef BottomSheetOptions
 * @type {BottomSheetOptions}
 * @property {component} component The React.Element to be rendered inside the bottom sheet body
 * @property {title} title String or React.Element to be rendered as bottom-sheet header title
 * @property {footer} footer React.Element or undefined to be rendered as sticky footer of our bottom sheet
 * @property {snapPoint} snapPoint The array of points used to pin the height of the bottom sheet
 * @property {onDismiss} onDismiss The possible function to be used as an effect of the dismissal of the bottom sheet
 */
type BottomSheetOptions = {
  component: React.ReactNode;
  title: string | React.ReactNode;
  snapPoint?: NonEmptyArray<number | string>;
  footer?: React.ReactElement;
  fullScreen?: boolean;
  onDismiss?: () => void;
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 */
export const useIOBottomSheetModal = ({
  component,
  title,
  snapPoint,
  footer,
  onDismiss
}: Omit<BottomSheetOptions, "fullScreen">): IOBottomSheetModal => {
  const insets = useSafeAreaInsets();
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const { onOpen, onClose } = useHardwareBackButtonToDismiss(dismissAll);
  const [screenReaderEnabled, setIsScreenReaderEnabled] =
    useState<boolean>(false);

  const header = <BottomSheetHeader title={title} onClose={dismissAll} />;
  const bottomSheetContent = (
    <BottomSheetScrollView
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
    >
      {component}
      {footer ? (
        <>
          <VSpacer size={48} />
          <VSpacer size={48} />
        </>
      ) : (
        <View style={{ height: insets.bottom }} />
      )}
    </BottomSheetScrollView>
  );

  const handleDismiss = () => {
    onDismiss?.();
    onClose();
  };

  const present = () => {
    bottomSheetModalRef.current?.present();
    onOpen();
  };

  // // Add opacity fade effect to backdrop
  const BackdropElement = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        opacity={0.2}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  useEffect(() => {
    // Check if the screen reader is enabled when the component is mounted
    isScreenReaderEnabled()
      .then(setIsScreenReaderEnabled)
      .catch(_ => setIsScreenReaderEnabled(false));
    // Subscribe to `screenReaderChanged` to properly update the state.
    // The method above is necessary because the event listener is triggered
    // only when the screen reader internal state changes.
    // Unfortunately its function is not executed on subscription.
    const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setIsScreenReaderEnabled
    );
    return () => screenReaderChangedSubscription.remove();
  }, []);

  const bottomSheet = (
    <BottomSheetModal
      style={styles.bottomSheet}
      footerComponent={(props: BottomSheetFooterProps) =>
        footer ? (
          <BottomSheetFooter
            {...props}
            // bottomInset={insets.bottom}
            style={{
              paddingBottom: insets.bottom,
              backgroundColor: IOColors.white
            }}
          >
            {footer}
          </BottomSheetFooter>
        ) : null
      }
      enableDynamicSizing={snapPoint ? false : true}
      maxDynamicContentSize={screenHeight - insets.top}
      snapPoints={snapPoint}
      ref={bottomSheetModalRef}
      handleComponent={_ => header}
      backdropComponent={BackdropElement}
      enableDismissOnClose={true}
      accessible={false}
      importantForAccessibility={"yes"}
      onDismiss={handleDismiss}
    >
      {screenReaderEnabled && Platform.OS === "android" ? (
        <Modal>
          <View style={IOStyles.flex} accessible={true}>
            {header}
            {bottomSheetContent}
          </View>
          {footer && (
            <View style={{ paddingBottom: insets.bottom }}>{footer}</View>
          )}
        </Modal>
      ) : (
        bottomSheetContent
      )}
    </BottomSheetModal>
  );
  return { present, dismiss: dismissAll, bottomSheet };
};

// const DEFAULT_AUTORESIZABLE_SNAP_POINT = 1;
// const DEFAULT_BOTTOM_PADDING: IOSpacingScale = 72;

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, that autosizes to the height of its content
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 * @param bottomPadding the bottom padding of the bottom sheet, default is 24
 */
// export const useIOBottomSheetAutoresizableModal = (
//   {
//     component,
//     title,
//     footer,
//     onDismiss,
//     fullScreen
//   }: Omit<BottomSheetOptions, "snapPoint">,
//   // FIXME: currently the auto-resize logic measures the height of the content without
//   // including the footer, so we need to manually add its height as bottom padding.
//   // We should find a way to make the autoresizable bottom sheet work with the footer!
//   bottomPadding: number = DEFAULT_BOTTOM_PADDING
// ) => {
//   const [snapPoint, setSnapPoint] = React.useState<number>(
//     DEFAULT_AUTORESIZABLE_SNAP_POINT
//   );
//   const insets = useSafeAreaInsets();

//   const handleContentOnLayout = React.useCallback(
//     (event: LayoutChangeEvent) => {
//       const { height } = event.nativeEvent.layout;
//       const snapPointWithPadding = insets.bottom + bottomPadding + height;

//       setSnapPoint(
//         fullScreen
//           ? snapPointWithPadding
//           : Math.min(screenHeight - insets.top, snapPointWithPadding)
//       );
//     },
//     [insets, fullScreen, bottomPadding]
//   );

//   const contentComponent = (
//     <View onLayout={handleContentOnLayout}>{component}</View>
//   );

//   return useIOBottomSheetModal({
//     component: contentComponent,
//     title,
//     snapPoint: [snapPoint],
//     footer,
//     onDismiss
//   });
// };

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param component
 * @param title
 * @param snapPoint
 * @param footer
 * @param onDismiss callback to be called when the bottom sheet is dismissed
 * @deprecated
 * use `useIOBottomSheetModal` instead
 * TODO remove once all the occurencies of `useLegacyIOBottomSheetModal` will be replaced by `useIOBottomSheetModal`
 */
export const useLegacyIOBottomSheetModal = (
  component: React.ReactNode,
  title: string | React.ReactNode,
  snapPoint: number,
  footer?: React.ReactElement,
  onDismiss?: () => void
): IOBottomSheetModal => {
  const insets = useSafeAreaInsets();

  return useIOBottomSheetModal({
    component,
    title,
    snapPoint: [snapPoint + insets.top],
    footer,
    onDismiss
  });
};
