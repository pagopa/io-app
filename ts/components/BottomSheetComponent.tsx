import { View, Text } from "native-base";
import * as React from "react";
import { Animated, StyleSheet } from "react-native";
import BottomSheet from "reanimated-bottom-sheet";
import I18n from "../i18n";
import customVariables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { IOColors } from "./core/variables/IOColors";
import { IOStyles } from "./core/variables/IOStyles";
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

  const color = opacity.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]
  });

  const modalBackdrop = {
    backgroundColor: color
  };

  React.useEffect(() => {
    if (props.content) {
      openBottomSheet();
    } else {
      closeBottomSheet();
    }
  }, [props.content]);

  const closeBottomSheet = () => {
    if (bottomSheetRef && bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(0);
      Animated.timing(opacity, {
        useNativeDriver: false,
        toValue: 0,
        duration: 200
      }).start();
      props.handleClose();
    }
  };

  const openBottomSheet = () => {
    if (bottomSheetRef && bottomSheetRef.current) {
      bottomSheetRef.current.snapTo(1);
    }
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.container]}>
      <Text style={styles.title} semibold={true}>
        {props.bottomSheetTitle}
      </Text>
      <ButtonDefaultOpacity
        style={styles.modalClose}
        onPress={closeBottomSheet}
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

  return (
    <>
      <Animated.View
        pointerEvents={"none"}
        style={[styles.hover, modalBackdrop]}
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={[0, props.maxSnapPoint]}
        onOpenEnd={() =>
          Animated.timing(opacity, {
            useNativeDriver: false,
            toValue: 1,
            duration: 200
          }).start()
        }
        onCloseEnd={() =>
          Animated.timing(opacity, {
            useNativeDriver: false,
            toValue: 0,
            duration: 200
          }).start()
        }
        renderHeader={renderHeader}
        renderContent={() => (
          <View style={styles.content}>{props.content}</View>
        )}
      />
    </>
  );
};

export default BottomSheetComponent;
