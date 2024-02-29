import * as React from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Pressable
} from "react-native";
import { Icon, VSpacer } from "@pagopa/io-app-design-system";
import { H4 } from "../../core/typography/H4";
import { H5 } from "../../core/typography/H5";
import { IOStyles } from "../../core/variables/IOStyles";
import { WithTestID } from "../../../types/WithTestID";

type Props = WithTestID<{
  isFirst: boolean;
  isFavourite: boolean;
  logo: ImageSourcePropType;
  title: string;
  description: string;
  rightElement: JSX.Element;
  onPress?: () => void;
}>;

const styles = StyleSheet.create({
  cardLogo: {
    height: 26,
    width: 41,
    resizeMode: "contain"
  },
  paymentMethodInfo: {
    paddingLeft: 15,
    paddingRight: 15,
    flex: 1
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  }
});
const PickPaymentMethodBaseListItem: React.FC<Props> = ({
  isFavourite,
  logo,
  title,
  description,
  rightElement,
  onPress,
  testID
}) => (
  <Pressable onPress={onPress} testID={testID} style={{ paddingEnd: 0 }}>
    <VSpacer />
    <View style={styles.contentContainer}>
      <View style={[styles.row, IOStyles.flex]}>
        <Image source={logo} style={styles.cardLogo} testID={"cardImage"} />
        <VSpacer size={16} />
        <View style={styles.paymentMethodInfo}>
          <H4 weight={"SemiBold"} color={"bluegreyDark"} numberOfLines={1}>
            {title}
          </H4>
          <H5 weight={"Regular"} color={"bluegreyDark"} numberOfLines={2}>
            {description}
          </H5>
        </View>
      </View>
      <View style={styles.row}>
        {isFavourite && <Icon name="starFilled" color="blue" size={24} />}
        {rightElement}
      </View>
    </View>
    <VSpacer />
  </Pressable>
);

export default PickPaymentMethodBaseListItem;
