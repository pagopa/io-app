import { Badge, View, Text } from "native-base";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { H3 } from "../../../components/core/typography/H3";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import I18n from "../../../i18n";

type Props = {
  title: string;
  onPress?: () => void;
  image?: ImageSourcePropType;
  isNew: boolean;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 8,
    width: widthPercentageToDP("42.13%"),
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginRight: widthPercentageToDP("2.93%")
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between"
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  badgeContainer: { height: 18, backgroundColor: IOColors.blue },
  badgeText: { fontSize: 12, lineHeight: 18 }
});

const FeaturedCard: React.FunctionComponent<Props> = (props: Props) => (
  <TouchableDefaultOpacity style={styles.container} onPress={props.onPress}>
    <View style={styles.row}>
      {fromNullable(props.image).fold(
        <View
          style={{
            width: 40,
            height: 40
          }}
        />,
        i => (
          <Image style={styles.image} source={i} />
        )
      )}
      {props.isNew && (
        <Badge style={styles.badgeContainer}>
          <Text style={styles.badgeText} semibold={true}>
            {I18n.t("wallet.methods.newCome")}
          </Text>
        </Badge>
      )}
    </View>
    <View spacer small />
    <H3 weight={"SemiBold"} color={"blue"}>
      {props.title}
    </H3>
  </TouchableDefaultOpacity>
);

export default FeaturedCard;
