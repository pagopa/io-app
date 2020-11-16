import { Badge, View, Text } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
import { H3 } from "../../../components/core/typography/H3";
import { IOColors } from "../../../components/core/variables/IOColors";
import customVariables from "../../../theme/variables";

import bpdBonusLogo from "../../../../img/bonus/bpd/logo_BonusCashback_White.png";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";

type Props = {
  title?: string;
  onPress?: () => void;
  image?: string;
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14,
    borderRadius: 8,
    width: 158,
    height: 102,
    backgroundColor: "white",
    shadowColor: "#00274e",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  column: {
    flexDirection: "column",
    justifyContent: "space-between"
  }
});

const FeaturedCard: React.FunctionComponent<Props> = (props: Props) => (
  <TouchableDefaultOpacity style={styles.container}>
    <View style={styles.row}>
      <View style={styles.column}>
        <Image
          style={{
            width: 40,
            height: 40,
            resizeMode: "contain"
          }}
          source={bpdBonusLogo}
        />
        <View spacer small />
        <H3 weight={"SemiBold"} color={"blue"}>
          Cashback
        </H3>
      </View>
      <Badge style={{ height: 18, backgroundColor: IOColors.blue }}>
        <Text style={{ fontSize: 12, lineHeight: 18 }} semibold={true}>
          Novità
        </Text>
      </Badge>
    </View>
  </TouchableDefaultOpacity>
);

export default FeaturedCard;
