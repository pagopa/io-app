import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
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
    marginTop: 5,
    backgroundColor: customVariables.brandHighLighter
  },
  headerText: {
    fontSize: customVariables.fontSizeSmall,
    marginRight: 9
  },
  badgeText: {
    fontSize: customVariables.fontSizeSmaller,
    lineHeight: 16
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,

    backgroundColor: customVariables.brandDarkGray,
    borderRadius: 8,
    marginBottom: -1,
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
    ],
    zIndex: 2
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
                  <Text style={styles.badgeText}>
                    {/* Replace with I18n.t("wallet.methods.newCome") after PR #1875 */}
                    Novità
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
