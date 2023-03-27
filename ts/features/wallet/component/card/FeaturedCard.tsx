import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text as NBText } from "native-base";
import * as React from "react";
import { View, Image, ImageSourcePropType, StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { IOColors } from "../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity, {
  TouchableDefaultOpacityProps
} from "../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";

type Props = {
  title: string;
  onPress?: () => void;
  image?: ImageSourcePropType;
  isNew: boolean;
  testID?: TouchableDefaultOpacityProps["testID"];
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding / 2,
    paddingVertical: 14,
    marginBottom: 10,
    borderRadius: 8,
    width: widthPercentageToDP("42.13%"),
    backgroundColor: IOColors.white,
    shadowColor: customVariables.cardShadow,
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
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  },
  badgeContainer: { height: 18, backgroundColor: IOColors.blue },
  badgeText: { fontSize: 12, lineHeight: 18 }
});

const FeaturedCard: React.FunctionComponent<Props> = (props: Props) => (
  <TouchableDefaultOpacity
    style={styles.container}
    onPress={props.onPress}
    testID={props.testID}
  >
    <View style={styles.row}>
      {pipe(
        props.image,
        O.fromNullable,
        O.fold(
          () => (
            <View
              style={{
                width: 40,
                height: 40
              }}
            />
          ),
          i => <Image style={styles.image} source={i} />
        )
      )}
      {props.isNew && (
        <Badge style={styles.badgeContainer}>
          <NBText style={styles.badgeText} semibold={true}>
            {I18n.t("wallet.methods.newCome")}
          </NBText>
        </Badge>
      )}
    </View>
    <VSpacer size={8} />
    <H3 weight={"SemiBold"} color={"blue"}>
      {props.title}
    </H3>
  </TouchableDefaultOpacity>
);

export default FeaturedCard;
