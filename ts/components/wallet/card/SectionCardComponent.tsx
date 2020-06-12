import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { AddPaymentMethodButton } from "../AddPaymentMethodButton";

type Props = {
  onPress: () => void;
  label: string;
  isError?: boolean;
  isNew?: boolean;
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  flexRow2: {
    flexDirection: "row",
    alignItems: "center"
  },
  brandLightGray: {
    color: customVariables.brandGray
  },
  badgeColor: {
    height: 18,
    marginTop: 4,
    backgroundColor: customVariables.brandHighLighter
  },
  headerText: {
    fontSize: customVariables.fontSizeSmall,
    marginRight: 9
  },
  badgeText: {
    marginTop: 2,
    fontSize: customVariables.fontSizeSmaller,
    lineHeight: Platform.OS === "ios" ? 14 : 16
  },
  cardInner: {
    paddingBottom: 13,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 13
  },
  card: {
    // iOS and Andorid card shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7,
    backgroundColor: customVariables.brandDarkGray,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 20
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotateCard: {
    marginBottom: -(58 / 2 + 4),
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [
      { perspective: 700 },
      { rotateX: "-20deg" },
      { scaleX: 0.98 },
      { translateY: -(58 / 2 + 20) * (1 - Math.cos(20)) }
    ]
  },
  rotateText: {
    flex: 1,
    transform: [{ perspective: 700 }, { rotateX: "20deg" }, { scaleX: 0.98 }]
  }
});

const SectionCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { label, onPress, isNew, isError } = props;
  return (
    <View style={styles.rotateCard}>
      <View style={[styles.card, styles.flatBottom]}>
        <View style={[styles.cardInner]}>
          <View style={[styles.flexRow, styles.rotateText]}>
            <View style={styles.flexRow2}>
              <Text style={[styles.brandLightGray, styles.headerText]}>
                {label}
              </Text>
              {isNew && (
                <Badge style={styles.badgeColor}>
                  <Text semibold={true} style={styles.badgeText}>
                    {I18n.t("wallet.methods.newCome")}
                  </Text>
                </Badge>
              )}
            </View>
            <View>
              {!isError && (
                <AddPaymentMethodButton
                  onPress={onPress}
                  iconSize={customVariables.fontSize2}
                  labelSize={customVariables.fontSizeSmall}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SectionCardComponent;
