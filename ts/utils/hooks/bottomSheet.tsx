import * as React from "react";
import { ComponentProps, useEffect, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { View, Modal, Platform, LayoutChangeEvent } from "react-native";
import { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter";
import { NonEmptyArray } from "fp-ts/lib/NonEmptyArray";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurredBackgroundComponent } from "../../components/bottomSheet/BlurredBackgroundComponent";
import { BottomSheetHeader } from "../../components/bottomSheet/BottomSheetHeader";
import { useHardwareBackButtonToDismiss } from "../../hooks/useHardwareBackButton";
import { TestID } from "../../types/WithTestID";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { isScreenReaderEnabled } from "../accessibility";
import { VSpacer } from "../../components/core/spacer/Spacer";

type Props = {
  children: React.ReactNode;
  footer?: React.ReactNode;
} & TestID;

/**
 * Build the base content of a BottomSheet including content padding and a ScrollView
 */
const BottomSheetContent: React.FunctionComponent<Props> = ({
  children,
  testID
}: Props) => (
  <View
    style={{ flex: 1, ...IOStyles.horizontalContentPadding }}
    testID={testID}
  >
    <BottomSheetScrollView>{children}</BottomSheetScrollView>
  </View>
);

export type BottomSheetModalProps = {
  content: React.ReactNode;
  config: {
    backdropComponent: ComponentProps<
      typeof BottomSheetModal
    >["backdropComponent"];
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
      backdropComponent: () => BlurredBackgroundComponent(onClose),
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
  snapPoint: NonEmptyArray<number>;
  footer?: React.ReactElement;
  onDismiss?: () => void;
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 */
export const useIOBottomSheetModalNew = ({
  component,
  title,
  snapPoint,
  footer,
  onDismiss
}: BottomSheetOptions): IOBottomSheetModal => {
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const setBSOpened = useHardwareBackButtonToDismiss(dismissAll);
  const [screenReaderEnabled, setIsScreenReaderEnabled] =
    useState<boolean>(false);

  const bottomSheetProps = bottomSheetContent(component, title, dismissAll);

  const present = () => {
    bottomSheetModalRef.current?.present();
    setBSOpened();
  };

  useEffect(() => {
    isScreenReaderEnabled()
      .then(sre => setIsScreenReaderEnabled(sre))
      .catch(_ => setIsScreenReaderEnabled(false));
  }, []);

  const bottomSheet = (
    <BottomSheetModal
      footerComponent={(_: BottomSheetFooterProps) =>
        footer !== undefined ? (
          <>
            {footer}
            <VSpacer size={16} />
          </>
        ) : null
      }
      snapPoints={[...snapPoint]}
      ref={bottomSheetModalRef}
      handleComponent={_ => bottomSheetProps.config.handleComponent}
      backdropComponent={bottomSheetProps.config.backdropComponent}
      enableDismissOnClose={true}
      accessible={false}
      // set this attribute to an empty string to avoid the default announcement from the library
      accessibilityPositionChangeAnnouncement={""}
      handleComponentAccessibility={{
        accessible: false
      }}
      importantForAccessibility={"yes"}
      onDismiss={onDismiss}
    >
      {screenReaderEnabled && Platform.OS === "android" ? (
        <Modal>
          <View style={IOStyles.flex} accessible={true}>
            {bottomSheetProps.config.handleComponent}
            {bottomSheetProps.content}
          </View>
          <>
            {footer !== undefined ? (
              <>
                {footer}
                <VSpacer size={16} />
              </>
            ) : null}
            <VSpacer size={16} />
          </>
        </Modal>
      ) : (
        bottomSheetProps.content
      )}
    </BottomSheetModal>
  );
  return { present, dismiss: dismissAll, bottomSheet };
};

const DEFAULT_AUTORESIZABLE_SNAP_POINT = 1;
const DEFAULT_BOTTOM_PADDING = 300;
/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, that autosizes to the height of its content
 * @param bottomSheetOptions
 * @see {BottomSheetOptions}
 * @param bottomPadding the bottom padding of the bottom sheet, default is 0
 */
export const useIOBottomSheetAutoresizableModal = (
  {
    component,
    title,
    footer,
    onDismiss
  }: Omit<BottomSheetOptions, "snapPoint">,
  bottomPadding: number = DEFAULT_BOTTOM_PADDING
) => {
  const [snapPoint, setSnapPoint] = React.useState<number>(
    DEFAULT_AUTORESIZABLE_SNAP_POINT
  );
  const insets = useSafeAreaInsets();

  const handleContentOnLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;

      setSnapPoint(insets.bottom + bottomPadding + height);
    },
    [insets, bottomPadding]
  );

  return useIOBottomSheetModalNew({
    component: <View onLayout={handleContentOnLayout}>{component}</View>,
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
 * use `useIOBottomSheetModalNew` instead
 * TODO remove once all the occurencies of `useIOBottomSheetModal` will be replaced by `useIOBottomSheetModalNew`
 */
export const useIOBottomSheetModal = (
  component: React.ReactNode,
  title: string | React.ReactNode,
  snapPoint: number,
  footer?: React.ReactElement,
  onDismiss?: () => void
): IOBottomSheetModal =>
  useIOBottomSheetModalNew({
    component,
    title,
    snapPoint: [snapPoint],
    footer,
    onDismiss
  });
