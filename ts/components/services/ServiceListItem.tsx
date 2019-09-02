import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import { Grid, Left, ListItem, Right, Row, Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet, Switch } from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import IconFont from "../../components/ui/IconFont";
import I18n from "../../i18n";
import {
  EnabledChannels,
  getEnabledChannelsForService
} from "../../screens/preferences/common";
import { ProfileState } from "../../store/reducers/profile";
import { makeFontStyleObject } from "../../theme/fonts";
import variables from "../../theme/variables";
import { BadgeComponent } from "../screens/BadgeComponent";

interface State {
  uiEnabledChannels: EnabledChannels;
}

type Props = Readonly<{
  item: pot.Pot<ServicePublic, Error>;
  profile: ProfileState;
  onSelect: (service: ServicePublic) => void;
  isRead: boolean;
  onLongPress?: () => void;
  onSwitch?: (service: ServicePublic) => void;
  isLongPressEnabled: boolean;
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

export class ServiceListItem extends React.PureComponent<Props, State> {
  // tslint:disable-next-line:cognitive-complexity
  public render() {
    const potService = this.props.item;
    const enabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );

    const onSwitchTap = this.props.onSwitch
      ? pot.toUndefined(
          pot.map(potService, service => () => {
            if (this.props.onSwitch) {
              this.props.onSwitch(service);
            }
          })
        )
      : undefined;

    const onPress = !this.props.isLongPressEnabled
      ? pot.toUndefined(
          pot.map(potService, service => () => this.props.onSelect(service))
        )
      : undefined;

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

    // whether last attempt to save the preferences failed
    const profileVersion = pot
      .toOption(this.props.profile)
      .mapNullable(_ => (_.has_profile ? _.version : null))
      .getOrElse(0 as NonNegativeInteger);

    return (
      <ListItem
        onPress={onPress}
        style={styles.listItem}
        onLongPress={this.props.onLongPress}
      >
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
          {this.props.isLongPressEnabled ? (
            <Switch
              key={`switch-service-${profileVersion}`}
              value={pot.isSome(enabledChannels) && enabledChannels.value.inbox}
              onValueChange={onSwitchTap}
            />
          ) : (
            <IconFont name="io-right" color={variables.brandPrimary} />
          )}
        </Right>
      </ListItem>
    );
  }
}
