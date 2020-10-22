import { View, Text, Container } from "native-base";
import * as React from "react";
import { Animated, Modal, StyleSheet } from "react-native";
import BottomSheet from "reanimated-bottom-sheet";
import { useHardwareBackButton } from "../features/bonus/bonusVacanze/components/hooks/useHardwareBackButton";

import I18n from "../i18n";
import customVariables from "../theme/variables";
import { isScreenReaderEnabled } from "../utils/accessibility";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { IOColors } from "./core/variables/IOColors";
import { IOStyles } from "./core/variables/IOStyles";
import AppHeader from "./ui/AppHeader";
import IconFont from "./ui/IconFont";

type Props = {
  bottomSheetTitle: string;
  handleClose: () => void;
  maxSnapPoint: number;
  content?: React.ReactNode;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 18,
    color: customVariables.lightGray,
    alignSelf: "center",
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    lineHeight: customVariables.lineHeightBase
  },
  modalClose: {
    flex: 1,
    paddingRight: 0,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  icon: {
    paddingRight: 0
  },
  container: {
    alignSelf: "center",
    width: "100%",
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    backgroundColor: customVariables.colorWhite,
    ...IOStyles.horizontalContentPadding,
    paddingTop: 16
  },
  content: {
    ...IOStyles.horizontalContentPadding,
    width: "100%",
    height: "100%",
    backgroundColor: IOColors.white
  },
  hover: {
    minWidth: "100%",
    minHeight: "100%",
    bottom: 0,
    left: 0,
    top: 0,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center"
  }
});

const BottomSheetComponent: React.FunctionComponent<Props> = (props: Props) => {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [opacity] = React.useState(new Animated.Value(0));
  const [accessible, setAccessible] = React.useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);

  const color = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]
  });

  const modalBackdrop = {
    backgroundColor: color
  };

  const openBackdropAnimation = () =>
    Animated.timing(opacity, {
      useNativeDriver: false,
      toValue: 1,
      duration: 200
    }).start();

  const closeBackdropAnimation = () =>
    Animated.timing(opacity, {
      useNativeDriver: false,
      toValue: 0,
      duration: 200
    }).start();

  React.useEffect(() => {
    if (props.content) {
      openBottomSheet().catch(_ => closeBottomSheet());
    } else {
      closeBottomSheet();
    }
  }, [props.content]);

  useHardwareBackButton(() => {
    closeBottomSheet();
    return true;
  });

  const closeBottomSheet = () => {
    setAccessible(false);
    if (bottomSheetRef && bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(0);
      setBottomSheetOpen(false);
      closeBackdropAnimation();
    }
  };

  const openBottomSheet = async () => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    setAccessible(isScreenReaderActive);
    if (bottomSheetRef && bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(1);
      openBackdropAnimation();
      setBottomSheetOpen(true);
    }
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.container]}>
      <Text style={styles.title} semibold={true}>
        {props.bottomSheetTitle}
      </Text>
      <ButtonDefaultOpacity
        style={styles.modalClose}
        onPress={props.handleClose}
        transparent={true}
        accessible={true}
        accessibilityRole={"button"}
        accessibilityLabel={I18n.t("global.buttons.close")}
      >
        <IconFont
          name="io-close"
          color={customVariables.lightGray}
          style={styles.icon}
        />
      </ButtonDefaultOpacity>
    </View>
  );

  return accessible ? (
    <Modal>
      <Container>
        <AppHeader noLeft={true}>{renderHeader()}</AppHeader>
        <View style={styles.content}>{props.content}</View>
      </Container>
    </Modal>
  ) : (
    <>
      <Animated.View
        pointerEvents={bottomSheetOpen ? "auto" : "none"}
        style={[styles.hover, modalBackdrop]}
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[0, props.maxSnapPoint]}
        onOpenEnd={() => {
          openBackdropAnimation();
        }}
        onCloseEnd={() => {
          closeBackdropAnimation();
          setBottomSheetOpen(false);
          props.handleClose();
        }}
        renderHeader={renderHeader}
        renderContent={() => (
          <View style={styles.content}>{props.content}</View>
        )}
      />
    </>
  );
};

export default BottomSheetComponent;
