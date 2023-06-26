import * as React from "react";
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ViewStyle
} from "react-native";
import I18n from "../../../i18n";
import TouchableDefaultOpacity from "../../TouchableDefaultOpacity";
import { hexToRgba, IOColors } from "../../core/variables/IOColors";
import { IOBadge } from "../../core/IOBadge";
import { Label } from "../../core/typography/Label";
import { Icon } from "../../core/icons";
import { IOStyles } from "../../core/variables/IOStyles";
import { HSpacer } from "../../core/spacer/Spacer";

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
  testId?: string;
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

const styles = StyleSheet.create({
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
  shadowBox: {
    marginBottom: -15,
    borderRadius: 8,
    borderTopWidth: 8,
    borderTopColor: opaqueBorderColor,
    height: 15
  }
});

const SectionCardComponent: React.FunctionComponent<Props> = (props: Props) => {
  const { label, onPress, isNew, isError, cardStyle, testId } = props;
  const rightLabel = () => {
    switch (props.status) {
      case undefined:
      case "add":
        return (
          <>
            <Icon name="add" size={20} color="white" />
            <HSpacer size={4} />
            <Label color="white" weight="Bold" testID={testId}>
              {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
            </Label>
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
            testID={testId}
          />
        );
      case "refresh":
        return (
          <View style={[IOStyles.row, IOStyles.alignCenter]}>
            <Label weight="Bold" color="white" testID={testId}>
              {I18n.t("wallet.newPaymentMethod.refresh").toUpperCase()}
            </Label>
            <HSpacer size={8} />
            <Icon color="white" name="reload" size={16} />
          </View>
        );
      case "show":
        return (
          <View style={IOStyles.row}>
            <Label color="white" weight="Bold" testID={testId}>
              {I18n.t("wallet.newPaymentMethod.show").toUpperCase()}
            </Label>
            <HSpacer size={4} />
            <Icon size={20} color="white" name="chevronRightListItem" />
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
            <View style={[IOStyles.row, IOStyles.alignCenter]}>
              <View style={[IOStyles.row, IOStyles.flex, IOStyles.alignCenter]}>
                <Label
                  weight="Regular"
                  color="white"
                  ellipsizeMode="tail"
                  numberOfLines={1}
                >
                  {label}
                </Label>
                {isNew && (
                  <View style={[IOStyles.row, IOStyles.alignCenter]}>
                    <HSpacer size={8} />
                    <IOBadge
                      small
                      text={I18n.t("wallet.methods.newCome")}
                      variant="solid"
                      color="aqua"
                    />
                    <HSpacer size={8} />
                  </View>
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
