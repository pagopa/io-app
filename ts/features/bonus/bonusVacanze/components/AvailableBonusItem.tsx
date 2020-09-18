import { Badge, Grid, ListItem, Row, Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { BonusAvailable } from "../../../../../definitions/content/BonusAvailable";
import { BonusAvailableContent } from "../../../../../definitions/content/BonusAvailableContent";
import I18n from "../../../../i18n";
import variables from "../../../../theme/variables";
import { getLocalePrimaryWithFallback } from "../../../../utils/locale";
import { maybeNotNullyString } from "../../../../utils/strings";

type Props = {
  bonusItem: BonusAvailable;
  onPress: () => void;
};

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
    lineHeight: Platform.OS === "ios" ? 14 : 16
  },
  centeredContents: {
    alignItems: "center"
  },
  servicesName: {
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
  const bonusTypeLocalizedContent: BonusAvailableContent =
    bonusItem[getLocalePrimaryWithFallback()];
  const maybeSponsorDescription = maybeNotNullyString(
    bonusItem.sponsorship_description
  );
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
                {bonusTypeLocalizedContent.name}
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
          {maybeSponsorDescription.isSome() && (
            <Row>
              <Text style={[styles.servicesName, disabledStyle]}>
                {maybeSponsorDescription.value}
              </Text>
            </Row>
          )}
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
