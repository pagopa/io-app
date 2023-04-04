import { Badge, Text as NBText } from "native-base";
import * as React from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ViewStyle
} from "react-native";
import IconFont from "../../../components/ui/IconFont";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { hexToRgba, IOColors } from "../../core/variables/IOColors";
import { Icon } from "../../core/icons";

export type SectionCardStatus = "add" | "refresh" | "loading" | "show";
type Props = {
  onPress: () => void;
  label: string;
  status?: SectionCardStatus;
  isError?: boolean;
  isNew?: boolean;
  cardStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
  flexRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  row: {
    flexDirection: "row"
  },
  topSpacing: {
    marginTop: 2
  },
  flexRow2: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center"
  },
  greyUltraLight: {
    color: IOColors.greyUltraLight
  },
  badgeColor: {
    height: 18,
    marginTop: 4,
    backgroundColor: customVariables.colorHighlight
  },
  headerText: {
    fontSize: 17,
    marginRight: 9
  },
  badgeText: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 16,
    color: IOColors.bluegrey
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
    borderRadius: 8,
    zIndex: -7,
    elevation: -7,
    height: 88,
    marginLeft: 0,
    marginRight: 0
  },
  cardBlueGrey: {
    backgroundColor: IOColors.bluegrey
  },
  flatBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  rotateCard: {
    shadowColor: IOColors.black,
    marginBottom: -38,
    flex: 1,
    shadowRadius: 10,
    shadowOpacity: 0.15,
    transform: [{ perspective: 1200 }, { rotateX: "-20deg" }, { scaleX: 0.99 }]
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  labelButton: {
    marginLeft: customVariables.fontSizeBase / 4,
    color: IOColors.white
  },
  shadowBox: {
    marginBottom: -15,
    borderRadius: 8,
    borderTopWidth: 8,
    borderTopColor: opaqueBorderColor,
    height: 15
  }
});

const SectionCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { label, onPress, isNew, isError, cardStyle } = props;
  const rightLabel = () => {
    switch (props.status) {
      case undefined:
      case "add":
        return (
          <>
            <Icon name="legAdd" size={20} color="white" />
            <NBText
              bold={true}
              style={[
                styles.labelButton,
                { fontSize: customVariables.fontSizeBase }
              ]}
            >
              {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
            </NBText>
          </>
        );
      case "loading":
        return (
          <ActivityIndicator
            size={24}
            color={"white"}
            accessible={false}
            importantForAccessibility={"no-hide-descendants"}
            accessibilityElementsHidden={true}
          />
        );
      case "refresh":
        return (
          <View style={styles.row}>
            <NBText bold={true} style={[styles.labelButton, { fontSize: 16 }]}>
              {I18n.t("wallet.newPaymentMethod.refresh").toUpperCase()}
            </NBText>
            {/* TODO: Replace this Unicode character with a proper Icon component
            with size and color props */}
            <NBText
              style={{
                fontSize: 32,
                height: 22,
                paddingTop: 8,
                color: IOColors.white
              }}
            >
              {" ⟳"}
            </NBText>
          </View>
        );
      case "show":
        return (
          <View style={styles.row}>
            <NBText
              bold={true}
              style={[
                styles.labelButton,
                { fontSize: customVariables.fontSizeBase }
              ]}
            >
              {I18n.t("wallet.newPaymentMethod.show").toUpperCase()}
            </NBText>
            <IconFont
              style={{ marginTop: 1, marginLeft: 2 }}
              name={"io-right"}
              color={IOColors.white}
              size={20}
            />
          </View>
        );
    }
  };

  return (
    <>
      {Platform.OS === "android" && (
        <View
          accessible={false}
          accessibilityElementsHidden={true}
          importantForAccessibility={"no-hide-descendants"}
          style={styles.shadowBox}
        />
      )}
      <TouchableDefaultOpacity
        style={styles.rotateCard}
        onPress={onPress}
        accessible={true}
        accessibilityRole={"button"}
      >
        <View
          style={[
            styles.card,
            styles.flatBottom,
            cardStyle || styles.cardBlueGrey
          ]}
        >
          <View
            style={styles.cardInner}
            accessibilityLabel={props.accessibilityLabel}
            accessibilityHint={props.accessibilityHint}
            accessibilityRole="button"
          >
            <View style={[styles.flexRow, styles.topSpacing]}>
              <View style={styles.flexRow2}>
                <NBText
                  style={[styles.greyUltraLight, styles.headerText]}
                  ellipsizeMode="tail"
                >
                  {label}
                </NBText>
                {isNew && (
                  <Badge style={styles.badgeColor}>
                    <NBText
                      semibold={true}
                      style={styles.badgeText}
                      dark={true}
                    >
                      {I18n.t("wallet.methods.newCome")}
                    </NBText>
                  </Badge>
                )}
              </View>
              {!isError && <View style={styles.button}>{rightLabel()}</View>}
            </View>
          </View>
        </View>
      </TouchableDefaultOpacity>
    </>
  );
};

export default SectionCardComponent;
