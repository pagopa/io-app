import * as pot from "italia-ts-commons/lib/pot";
import { Grid, Left, ListItem, Right, Row, Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import { getEnabledChannelsForService } from "../../screens/preferences/common";
import { ProfileState } from "../../store/reducers/profile";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import { BadgeComponent } from "../screens/BadgeComponent";

type Props = Readonly<{
  item: pot.Pot<ServicePublic, Error>;
  profile: ProfileState;
  onSelect: (service: ServicePublic) => void;
  isRead: boolean;
}>;

const styles = StyleSheet.create({
  spacingBase: {
    paddingTop: 6,
    paddingRight: variables.spacingBase
  },
  listItem: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  fixCroppedItalic: {
    // Leave a little bit of space in order to avoid cropped characters
    // due to italic style.
    paddingRight: variables.fontSizeBase / 3
  },
  serviceName: {
    fontSize: 18,
    color: variables.brandDarkestGray,
    ...makeFontStyleObject(Platform.select, "600"),
    alignSelf: "flex-start",
    paddingRight: 16
  }
});

export class ServiceListItem extends React.PureComponent<Props> {
  public render() {
    const potService = this.props.item;
    const enabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );

    const onPress = pot.toUndefined(
      pot.map(potService, service => () => this.props.onSelect(service))
    );

    const serviceName = pot.isLoading(potService)
      ? I18n.t("global.remoteStates.loading")
      : pot.isError(potService) || pot.isNone(potService)
        ? I18n.t("global.remoteStates.notAvailable")
        : potService.value.service_name;

    const inboxEnabledLabel = pot.map(
      enabledChannels,
      _ =>
        _.inbox
          ? I18n.t("services.serviceIsEnabled")
          : I18n.t("services.serviceNotEnabled")
    );

    return (
      <ListItem onPress={onPress} style={styles.listItem}>
        <Left>
          <Grid>
            <Row>
              {!this.props.isRead && (
                <View style={styles.spacingBase}>
                  <BadgeComponent />
                </View>
              )}
              <Text style={styles.serviceName}>{serviceName}</Text>
            </Row>
            <Row>
              <Text italic={true} style={styles.fixCroppedItalic}>
                {pot.getOrElse(inboxEnabledLabel, "")}
              </Text>
            </Row>
          </Grid>
        </Left>
        <Right>
          <IconFont name="io-right" color={variables.brandPrimary} />
        </Right>
      </ListItem>
    );
  }
}
