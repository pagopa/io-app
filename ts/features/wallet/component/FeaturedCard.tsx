import { Badge, View, Text } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { H3 } from "../../../components/core/typography/H3";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import I18n from "../../../i18n";

type Props = {
  title: string;
  onPress?: () => void;
  image?: number;
  isNew: boolean;
};

const CARD_WIDTH = 158;

const rightCardMargin =
  Dimensions.get("screen").width - 2 * 158 - 2 * customVariables.contentPadding;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14,
    borderRadius: 8,
    width: CARD_WIDTH,
    height: 102,
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
    marginRight: rightCardMargin
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
  }
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
        <Badge style={{ height: 18, backgroundColor: IOColors.blue }}>
          <Text style={{ fontSize: 12, lineHeight: 18 }} semibold={true}>
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
