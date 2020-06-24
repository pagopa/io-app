import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";

type Props = {
  onPress: () => void;
  label: string;
  isError?: boolean;
  isNew?: boolean;
  cardStyle?: ViewStyle;
};

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  flexRow2: {
    flexDirection: "row",
    flex: 1,
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
    fontSize: 17,
    marginRight: 9
  },
  badgeText: {
    marginTop: 2,
    fontSize: customVariables.fontSizeSmall,
    lineHeight: 16
  },
  cardInner: {
    paddingBottom: 13,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 13
  },
  card: {
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    zIndex: -7,
    elevation: -7,
    height: 88,
    borderRadius: 8,
    marginLeft: 0,
    marginRight: 0
  },
  cardGrey: {
    backgroundColor: customVariables.brandDarkGray
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotateCard: {
    shadowColor: "#000",
    marginBottom: -38,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }]
  },
  rotateText: {
    flex: 1
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  labelButton: {
    marginLeft: customVariables.fontSizeBase / 4,
    color: customVariables.colorWhite
  }
});

const SectionCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { label, onPress, isNew, isError, cardStyle } = props;
  return (
    <View style={styles.rotateCard}>
      <TouchableDefaultOpacity onPress={onPress}>
        <View
          style={[styles.card, styles.flatBottom, cardStyle || styles.cardGrey]}
        >
          <View style={[styles.cardInner]}>
            <View style={[styles.flexRow]}>
              <View style={styles.flexRow2}>
                <Text
                  style={[styles.brandLightGray, styles.headerText]}
                  ellipsizeMode="tail"
                >
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
              {!isError && (
                <View style={[styles.button]}>
                  <IconFont
                    name="io-plus"
                    color={customVariables.colorWhite}
                    size={customVariables.fontSize2}
                  />
                  <Text
                    bold={true}
                    style={[
                      styles.labelButton,
                      { fontSize: customVariables.fontSize1 }
                    ]}
                  >
                    {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableDefaultOpacity>
    </View>
  );
};

export default SectionCardComponent;
