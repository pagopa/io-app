import * as React from "react";
import {
  View,
  Image,
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedbackProps
} from "react-native";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { ShadowBox } from "../../screens/details/components/summary/base/ShadowBox";

type Props = {
  image: ImageSourcePropType;
  title: string;
  subtitle: string;
  rightText: string;
} & Pick<TouchableWithoutFeedbackProps, "onPress">;

const styles = StyleSheet.create({
  baseRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: IOColors.white
  },
  leftRow: {
    flex: 1,
    flexDirection: "row",
    paddingRight: 16
  },
  cardIcon: {
    width: 40,
    height: 25,
    overflow: "hidden",
    resizeMode: "contain",
    alignSelf: "center"
  },
  rightText: { alignSelf: "center" }
});

/**
 * Graphical settings and layout for the BpdTransactionItem
 * @param props
 * @constructor
 */
export const BaseBpdTransactionItem: React.FunctionComponent<Props> = props => (
  <TouchableOpacity
    style={{ marginVertical: 4, paddingHorizontal: 16 }}
    onPress={props.onPress}
  >
    <ShadowBox>
      {/* The base row */}
      <View style={styles.baseRow} testID={"BaseBpdTransactionItem"}>
        {/* The left side of the row (icon, space, top text, bottom text */}
        <View style={styles.leftRow}>
          <Image source={props.image} style={styles.cardIcon} />
          <HSpacer size={16} />
          <View style={IOStyles.flex}>
            <H4
              weight={"SemiBold"}
              color={"bluegreyDark"}
              ellipsizeMode={"tail"}
              numberOfLines={1}
              style={IOStyles.flex}
            >
              {props.title}
            </H4>
            <H5 color={"bluegrey"}>{props.subtitle}</H5>
          </View>
        </View>
        {/* The right side of the row */}
        <H4 weight={"SemiBold"} color={"blue"} style={styles.rightText}>
          {props.rightText}
        </H4>
      </View>
    </ShadowBox>
  </TouchableOpacity>
);
