import * as React from "react";
import { ComponentProps, useEffect, useState } from "react";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheetModal
} from "@gorhom/bottom-sheet";
import { View, Dimensions, Modal, Platform } from "react-native";
import { BottomSheetFooterProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter";
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
    snapPoints: ReadonlyArray<number>;
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
      handleComponent: header
    }
  };
};

/**
 * Hook to generate a bottomSheet with a title, snapPoint and a component, in order to wrap the invocation of bottomSheetContent
 * @param component
 * @param title
 * @param snapPoint
 * @param footer
 * @param onDismiss callback to be called when the bottom sheet is dismissed
 */
export const useIOBottomSheetModal = (
  component: React.ReactNode,
  title: string | React.ReactNode,
  snapPoint: number,
  footer?: React.ReactElement,
  onDismiss?: () => void
): IOBottomSheetModal => {
  const { dismissAll } = useBottomSheetModal();
  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
  const setBSOpened = useHardwareBackButtonToDismiss(dismissAll);
  const [screenReaderEnabled, setIsScreenReaderEnabled] =
    useState<boolean>(false);

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
      snapPoints={[snapPoint]}
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
