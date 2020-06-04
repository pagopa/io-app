import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Badge, Grid, ListItem, Row, Text, View } from "native-base";
import * as React from "react";
import { Image, Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";
import I18n from "../../../i18n";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import { BonusItem } from "../types/bonusList";

type OwnProps = {
  bonusItem: BonusItem;
  onPress: () => void;
};

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

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
const AvailableBonusItem: React.FunctionComponent<Props> = (props: Props) => {
  const { bonusItem, serviceById } = props;
  const isItemDisabled = !bonusItem.active;
  const disabledStyle = isItemDisabled ? styles.disabled : {};
  return (
    <ListItem
      style={styles.listItem}
      onPress={() => (isItemDisabled ? null : props.onPress())}
    >
      <View style={styles.columnLeft}>
        <Grid>
          <Row>
            <View style={styles.bonusItem}>
              <Text bold={true} style={[disabledStyle, styles.methodTitle]}>
                {bonusItem.name}
              </Text>
              {isItemDisabled && (
                <Badge style={styles.notImplementedBadge}>
                  <Text style={styles.notImplementedText}>
                    {I18n.t("wallet.methods.comingSoon")}
                  </Text>
                </Badge>
              )}
            </View>
          </Row>
          <Row>
            {serviceById &&
              pot.isSome(serviceById) && (
                <Text style={[styles.servicesName, disabledStyle]}>
                  {serviceById.value.organization_name}
                </Text>
              )}
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

const mapStateToProps = (state: GlobalState, props: OwnProps) => {
  const serviceById = fromNullable(props.bonusItem.service_id).fold(
    undefined,
    s => serviceByIdSelector(s)(state)
  );
  return {
    serviceById
  };
};

export default connect(mapStateToProps)(AvailableBonusItem);
