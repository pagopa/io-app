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
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import {
  JSX,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  AccessibilityInfo,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetHeader } from "../../components/bottomSheet/BottomSheetHeader";
import { useHardwareBackButtonToDismiss } from "../../hooks/useHardwareBackButton";
import { isScreenReaderEnabled } from "../accessibility";
import { useModalStyle } from "./useModalStyle";

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

export type IOBottomSheetModal = {
  bottomSheet: JSX.Element;
  dismiss: () => void;
  present: () => void;
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
  component: ReactNode;
  footer?: ReactElement;
  forceFullscreen?: boolean;
  onDismiss?: () => void;
  snapPoint?: NonEmptyArray<number | string>;
  title: ReactNode | string;
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
  onDismiss,
  forceFullscreen
}: BottomSheetOptions): IOBottomSheetModal => {
  const insets = useSafeAreaInsets();
  const theme = useIOTheme();
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { onOpen, onClose } = useHardwareBackButtonToDismiss(dismissAll);
  const [screenReaderEnabled, setIsScreenReaderEnabled] =
    useState<boolean>(false);

  const {
    backdrop: { opacity: backdropOpacity },
    modal: { backgroundColor }
  } = useModalStyle();

  const header = <BottomSheetHeader onClose={dismissAll} title={title} />;
  const bottomSheetContent = (
    <BottomSheetScrollView
      overScrollMode={"never"}
      style={{
        paddingHorizontal: IOVisualCostants.appMarginDefault
      }}
    >
      {component}
      {footer ? (
        <>
          <VSpacer size={48} />
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

  const present = useCallback(() => {
    bottomSheetModalRef.current?.present();
    onOpen();
  }, [onOpen]);

  // // Add opacity fade effect to backdrop
  const BackdropElement = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={backdropOpacity}
      />
    ),
    [backdropOpacity]
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
    <>
      {/*
        This is necessary to avoid the status bar overlaying the backdrop
        of the bottom sheet on Android devices. For reference, see:
        https://github.com/gorhom/react-native-bottom-sheet/issues/813
      */}
      {Platform.OS === "android" && (
        <StatusBar backgroundColor={"transparent"} translucent />
      )}
      <BottomSheetModal
        accessible={false}
        backdropComponent={BackdropElement}
        backgroundStyle={{ backgroundColor }}
        enableDismissOnClose={true}
        enableDynamicSizing={!snapPoint}
        footerComponent={(props: BottomSheetFooterProps) =>
          footer ? (
            <BottomSheetFooter
              {...props}
              // bottomInset={insets.bottom}
              style={{
                paddingBottom: insets.bottom,
                backgroundColor: IOColors[theme["appBackground-primary"]]
              }}
            >
              {footer}
            </BottomSheetFooter>
          ) : null
        }
        handleComponent={_ => header}
        importantForAccessibility={"yes"}
        maxDynamicContentSize={screenHeight - insets.top}
        onDismiss={handleDismiss}
        ref={bottomSheetModalRef}
        snapPoints={snapPoint}
        style={styles.bottomSheet}
      >
        {Platform.OS === "android" &&
        (screenReaderEnabled || forceFullscreen) ? (
          <Modal>
            <View accessible={true} style={{ flex: 1, backgroundColor }}>
              {header}
              {bottomSheetContent}
            </View>
            {footer && (
              <View style={{ paddingBottom: insets.bottom, backgroundColor }}>
                {footer}
              </View>
            )}
          </Modal>
        ) : (
          bottomSheetContent
        )}
      </BottomSheetModal>
    </>
  );
  return { present, dismiss: dismissAll, bottomSheet };
};
