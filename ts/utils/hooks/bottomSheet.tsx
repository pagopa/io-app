import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter";
import {
  IOBottomSheetHeaderRadius,
  IOSpacingScale,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Dimensions,
  LayoutChangeEvent,
  Modal,
  Platform,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetHeader } from "../../components/bottomSheet/BottomSheetHeader";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { useHardwareBackButtonToDismiss } from "../../hooks/useHardwareBackButton";
import { TestID } from "../../types/WithTestID";
import { isScreenReaderEnabled } from "../accessibility";
import { isIos } from "../platform";

const screenHeight = Dimensions.get("window").height;

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
} & TestID;

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
/**
 * Build the base content of a BottomSheet including content padding and a ScrollView
 */
const BottomSheetContent: React.FunctionComponent<Props> = ({
  children,
  testID
}: Props) => (
  <BottomSheetScrollView
    style={{
      flex: 1,
      paddingHorizontal: IOVisualCostants.appMarginDefault
    }}
    testID={testID}
  >
    {children}
  </BottomSheetScrollView>
);

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
  onClose: () => void
): BottomSheetModalProps => {
  const header = <BottomSheetHeader title={title} onClose={onClose} />;

  const bottomSheetBody: React.ReactNode = (
    <BottomSheetContent>{content}</BottomSheetContent>
  );

  return {
    content: bottomSheetBody,
    config: {
      handleComponent: header
    }
  };
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
  snapPoint: NonEmptyArray<number | string>;
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

  const bottomSheetProps = bottomSheetContent(component, title, dismissAll);

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

  const footerComponent = footer ? (
    <View style={{ paddingBottom: insets.bottom }}>{footer}</View>
  ) : null;

  const bottomSheet = (
    <BottomSheetModal
      style={styles.bottomSheet}
      footerComponent={(_: BottomSheetFooterProps) => footerComponent}
      snapPoints={[...snapPoint]}
      ref={bottomSheetModalRef}
      handleComponent={_ => bottomSheetProps.config.handleComponent}
      backdropComponent={BackdropElement}
      enableDismissOnClose={true}
      accessible={false}
      // set this attribute to an empty string to avoid the default announcement from the library
      accessibilityPositionChangeAnnouncement={""}
      handleComponentAccessibility={{
        accessible: false
      }}
      importantForAccessibility={"yes"}
      onDismiss={handleDismiss}
    >
      {screenReaderEnabled && Platform.OS === "android" ? (
        <Modal>
          <View style={IOStyles.flex} accessible={true}>
            {bottomSheetProps.config.handleComponent}
            {bottomSheetProps.content}
          </View>
          {footerComponent}
        </Modal>
      ) : (
        bottomSheetProps.content
      )}
    </BottomSheetModal>
  );
  return { present, dismiss: dismissAll, bottomSheet };
};

// On iOS the autoresizable bottom sheet does not open on first tap.
// This workaround seems to bypass the problem.
const DEFAULT_AUTORESIZABLE_SNAP_POINT = isIos ? 10 : 1;
const DEFAULT_BOTTOM_PADDING: IOSpacingScale = 72;

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, that autosizes to the height of its content
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 * @param bottomPadding the bottom padding of the bottom sheet, default is 24
 */
export const useIOBottomSheetAutoresizableModal = (
  {
    component,
    title,
    footer,
    onDismiss,
    fullScreen
  }: Omit<BottomSheetOptions, "snapPoint">,
  // FIXME: currently the auto-resize logic measures the height of the content without
  // including the footer, so we need to manually add its height as bottom padding.
  // We should find a way to make the autoresizable bottom sheet work with the footer!
  bottomPadding: number = DEFAULT_BOTTOM_PADDING
) => {
  const [snapPoint, setSnapPoint] = React.useState<number>(
    DEFAULT_AUTORESIZABLE_SNAP_POINT
  );
  const insets = useSafeAreaInsets();

  const handleContentOnLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      const snapPoint = insets.bottom + bottomPadding + height;

      setSnapPoint(
        fullScreen ? snapPoint : Math.min(screenHeight - insets.top, snapPoint)
      );
    },
    [insets, fullScreen, bottomPadding]
  );

  const contentComponent = (
    <View onLayout={handleContentOnLayout}>{component}</View>
  );

  return useIOBottomSheetModal({
    component: contentComponent,
    title,
    snapPoint: [snapPoint],
    footer,
    onDismiss
  });
};

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
