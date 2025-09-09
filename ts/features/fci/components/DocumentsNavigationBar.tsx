import { View, StyleSheet } from "react-native";
import {
  IOColors,
  HSpacer,
  H6,
  IconButton,
  WithTestID,
  ContentWrapper,
  useIOTheme,
  HStack
} from "@pagopa/io-app-design-system";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 14
  },
  shadow: {
    // iOS
    shadowColor: IOColors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    zIndex: 999,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android
    elevation: 8,
    borderBottomWidth: 0,
    position: "relative"
  }
});

export type IndicatorPositionEnum = "left" | "right";

type Props = WithTestID<{
  titleRight: string;
  titleLeft: string;
  iconRightDisabled?: boolean;
  iconLeftDisabled?: boolean;
  disabled?: boolean;
  indicatorPosition: IndicatorPositionEnum;
  onPrevious: () => void;
  onNext: () => void;
}>;

const renderNavigationComponent = (
  { onPrevious, onNext, iconLeftDisabled, iconRightDisabled }: Props,
  title: string
) => (
  <HStack space={8}>
    {/* button left */}
    <IconButton
      onPress={onPrevious}
      disabled={iconLeftDisabled}
      testID={"DocumentsNavigationBarLeftButtonTestID"}
      icon="chevronLeft"
      iconSize={24}
      accessibilityLabel="previous"
    />
    <H6>{title}</H6>
    {/* button right */}
    <IconButton
      onPress={onNext}
      disabled={iconRightDisabled}
      testID={"DocumentsNavigationBarRightButtonTestID"}
      icon="chevronRight"
      iconSize={24}
      accessibilityLabel="next"
    />
  </HStack>
);

/**
 * A component to render a documents navigation bar with two buttons
 * @param props
 * @returns
 */
const DocumentsNavigationBar = (props: Props) => {
  const theme = useIOTheme();

  const backgroundColor = IOColors[theme["appBackground-primary"]];
  const borderColor = IOColors[theme["divider-default"]];

  return (
    <View
      style={[
        styles.shadow,
        styles.container,
        { backgroundColor, borderColor }
      ]}
    >
      {props.indicatorPosition === "left" && (
        <>
          {renderNavigationComponent(props, props.titleLeft)}
          <View style={{ flex: 1 }} />
          <ContentWrapper>
            <H6>{props.titleRight}</H6>
          </ContentWrapper>
        </>
      )}
      {props.indicatorPosition === "right" && (
        <>
          <HSpacer />
          <H6>{props.titleLeft}</H6>
          <View style={{ flex: 1 }} />
          {renderNavigationComponent(props, props.titleRight)}
          <HSpacer />
        </>
      )}
    </View>
  );
};

export default DocumentsNavigationBar;
