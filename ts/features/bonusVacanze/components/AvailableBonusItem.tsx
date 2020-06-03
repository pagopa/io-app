import { Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import H5 from "../../../components/ui/H5";
import IconFont from "../../../components/ui/IconFont";
import { makeFontStyleObject } from "../../../theme/fonts";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { BonusItem } from "../types/bonusesAvailable";

type Props = {
  bonusItem: BonusItem;
  onPress: () => void;
};

const styles = StyleSheet.create({
  withoutLogo: {
    paddingTop: 19,
    paddingBottom: 11,
    alignItems: "center"
  },
  withLogo: {
    paddingTop: customVariables.spacerWidth,
    paddingBottom: 0,
    alignItems: "center"
  },
  bonusTitle: {
    ...makeFontStyleObject(Platform.select, "700"),
    flex: 1
  },
  bonusView: {
    backgroundColor: "#FFF",
    flexDirection: "row"
  },
  smallSpacer: {
    width: "100%",
    height: 4
  },
  viewStyle: {
    flexDirection: "row"
  },
  text3: {
    fontSize: 18,
    color: customVariables.brandDarkestGray
  },
  icon: {
    width: 64,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  displayFlexRow: {
    flex: 1,
    flexDirection: "row"
  },
  firstBlockContainer: {
    flex: 1
  },
  text3Container: {
    flex: 1,
    flexDirection: "row",
    minHeight: 24
  },
  bonusLogo: {
    height: 32,
    width: 32,
    resizeMode: "contain",
    marginBottom: 6,
    alignSelf: "flex-start",
    marginRight: customVariables.spacingBase
  }
});

const ICON_WIDTH = 24;

/**
 * Component to show the listItem for available bonuses list,
 * clicking the item user navigates to the request of the related bonus
 * @param props
 */
const AvailableBonusItem: React.FunctionComponent<Props> = (props: Props) => {
  const { bonusItem } = props;
  return (
    <TouchableDefaultOpacity onPress={() => props.onPress()}>
      <View
        style={[
          styles.bonusView,
          bonusItem.cover ? styles.withLogo : styles.withoutLogo
        ]}
      >
        <View spacer={true} large={true} />
        {bonusItem.cover && (
          <Image style={styles.bonusLogo} source={{ uri: bonusItem.cover }} />
        )}
        <H5 style={styles.bonusTitle}>{bonusItem.name}</H5>
      </View>
      <View style={styles.displayFlexRow}>
        <View style={styles.firstBlockContainer}>
          <View style={styles.viewStyle}>
            <Text xsmall={true}>
              {`${formatDateAsLocal(
                bonusItem.valid_from,
                true
              )} - ${formatDateAsLocal(bonusItem.valid_to, true)}`}
            </Text>
          </View>
          <View style={styles.smallSpacer} />
          <View style={styles.text3Container}>
            <Text numberOfLines={2} style={styles.text3}>
              {bonusItem.description}
            </Text>
          </View>
        </View>
        <View style={styles.icon}>
          <IconFont
            name="io-right"
            size={ICON_WIDTH}
            color={customVariables.contentPrimaryBackground}
          />
        </View>
      </View>
    </TouchableDefaultOpacity>
  );
};

export default AvailableBonusItem;
