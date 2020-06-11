import { Badge, Grid, ListItem, Row, Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { BonusAvailable } from "../../../../definitions/content/BonusAvailable";
import I18n from "../../../i18n";
import variables from "../../../theme/variables";

type OwnProps = {
  bonusItem: BonusAvailable;
  onPress: () => void;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  listItem: {
    marginLeft: 0,
    paddingRight: 0,
    flexDirection: "row"
  },
  disabled: {
    opacity: 0.75
  },
  bonusItem: {
    flexDirection: "column"
  },
  methodTitle: {
    fontSize: 16,
    color: variables.colorBlack
  },
  methodImage: {
    width: 48,
    height: 48,
    resizeMode: "contain"
  },
  columnLeft: {
    flex: 0.7,
    alignItems: "flex-start",
    alignContent: "center"
  },
  columnRight: {
    flex: 0.3,
    alignItems: "flex-end",
    alignContent: "center"
  },
  notImplementedBadge: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.lightGray
  },
  notImplementedText: {
    fontSize: 10,
    lineHeight: Platform.OS === "ios" ? 14 : 16
  },
  centeredContents: {
    alignItems: "center"
  },
  servicesName: {
    fontSize: variables.fontSizeSmall,
    color: variables.textColor
  }
});

/**
 * Component to show the listItem for available bonuses list,
 * clicking the item user navigates to the request of the related bonus
 * @param props
 */
export const AvailableBonusItem: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { bonusItem } = props;
  const isComingSoon = !bonusItem.is_active;
  const disabledStyle = isComingSoon ? styles.disabled : {};
  return (
    <ListItem
      style={styles.listItem}
      onPress={() => (isComingSoon ? null : props.onPress())}
    >
      <View style={styles.columnLeft}>
        <Grid>
          <Row>
            <View style={styles.bonusItem}>
              <Text bold={true} style={[disabledStyle, styles.methodTitle]}>
                {bonusItem.name}
              </Text>
              {isComingSoon && (
                <Badge style={styles.notImplementedBadge}>
                  <Text style={styles.notImplementedText}>
                    {I18n.t("wallet.methods.comingSoon")}
                  </Text>
                </Badge>
              )}
            </View>
          </Row>
          <Row>
            <Text style={[styles.servicesName, disabledStyle]}>
              {bonusItem.subtitle}
            </Text>
          </Row>
        </Grid>
      </View>
      <View style={styles.columnRight}>
        {bonusItem.cover && (
          <Image style={styles.methodImage} source={{ uri: bonusItem.cover }} />
        )}
      </View>
    </ListItem>
  );
};
