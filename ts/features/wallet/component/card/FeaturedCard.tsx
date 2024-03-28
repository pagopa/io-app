import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import TouchableDefaultOpacity, {
  TouchableDefaultOpacityProps
} from "../../../../components/TouchableDefaultOpacity";
import { IOBadge } from "../../../../components/core/IOBadge";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
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
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain"
  }
});

const FeaturedCard: React.FunctionComponent<Props> = (props: Props) => (
  <TouchableDefaultOpacity
    style={styles.container}
    onPress={props.onPress}
    testID={props.testID}
  >
    <View style={IOStyles.rowSpaceBetween}>
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
          i => (
            <Image
              accessibilityIgnoresInvertColors
              style={styles.image}
              source={i}
            />
          )
        )
      )}
      {props.isNew && (
        <View style={{ alignSelf: "flex-start" }}>
          <IOBadge
            small
            text={I18n.t("wallet.methods.newCome")}
            variant="solid"
            color="blue"
          />
        </View>
      )}
    </View>
    <VSpacer size={8} />
    <H3 weight={"SemiBold"} color={"blue"}>
      {props.title}
    </H3>
  </TouchableDefaultOpacity>
);

export default FeaturedCard;
