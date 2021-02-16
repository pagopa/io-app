import * as React from "react";
import { ListItem, View } from "native-base";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { H4 } from "../../core/typography/H4";
import { H5 } from "../../core/typography/H5";
import { IOColors } from "../../core/variables/IOColors";
import IconFont from "../../ui/IconFont";

type Props = {
  isFirst: boolean;
  isFavourite: boolean;
  logo: ImageSourcePropType;
  title: string;
  description: string;
  rightElement: JSX.Element;
  onPress: () => void;
};

const styles = StyleSheet.create({
  cardLogo: {
    height: 26,
    width: 41
  },
  paymentMethodInfo: {
    paddingLeft: 15
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1
  }
});
const PickPaymentMethodBaseListItem: React.FC<Props> = ({
  isFirst,
  isFavourite,
  logo,
  title,
  description,
  rightElement,
  onPress
}) => (
  <ListItem first={isFirst} onPress={onPress}>
    <View style={styles.contentContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image source={logo} style={styles.cardLogo} testID={"cardImage"} />
        <View spacer={true} />
        <View style={styles.paymentMethodInfo}>
          <H4 weight={"SemiBold"} color={"bluegreyDark"}>
            {title}
          </H4>
          <H5 weight={"Regular"} color={"bluegreyDark"}>
            {description}
          </H5>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {isFavourite && (
          <IconFont name={"io-filled-star"} color={IOColors.blue} size={24} />
        )}
        {rightElement}
      </View>
    </View>
  </ListItem>
);

export default PickPaymentMethodBaseListItem;
