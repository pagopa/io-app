import I18n from "i18n-js";
import { NonNegativeInteger } from "italia-ts-commons/lib/numbers";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import {
  EnabledChannels,
  getEnabledChannelsForService
} from "../../screens/preferences/common";
import { ProfileState } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import ListItemComponent from "../screens/ListItemComponent";

interface State {
  uiEnabledChannels: EnabledChannels;
}

type Props = Readonly<{
  item: pot.Pot<ServicePublic, Error>;
  profile: ProfileState;
  onSelect: (service: ServicePublic) => void;
  isRead: boolean;
  hideSeparator: boolean;
  onLongPress: () => void;
  isLongPressModeEnabled: boolean;
  onSwitch: (service: ServicePublic) => void;
}>;

const styles = StyleSheet.create({
  listItem: {
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  },
  fixCroppedItalic: {
    // Leave a little bit of space in order to avoid cropped characters
    // due to italic style.
    paddingRight: customVariables.fontSizeBase / 3
  },
  serviceName: {
    color: customVariables.brandDarkGray
  },
  headerWrapper: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 10
  },
  badgeMargin: {
    marginLeft: 4
  }
});

export default class NewServiceListItem extends React.PureComponent<
  Props,
  State
> {
  public render() {
    const { isLongPressModeEnabled } = this.props;
    const potService = this.props.item;
    const enabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );

    if (pot.isSome(potService)) {
      // tslint:disable-next-line no-object-mutation
      this.state = {
        uiEnabledChannels: getEnabledChannelsForService(
          this.props.profile,
          potService.value.service_id
        )
      };
    }

    const onPress = !this.props.isLongPressModeEnabled
      ? pot.toUndefined(
          pot.map(potService, service => () => this.props.onSelect(service))
        )
      : undefined;

    const onSwitchTap = this.props.isLongPressModeEnabled
      ? pot.toUndefined(
          pot.map(potService, service => () => this.props.onSwitch(service))
        )
      : undefined;

    const inboxEnabledLabel = pot.map(
      enabledChannels,
      _ =>
        _.inbox
          ? I18n.t("services.serviceIsEnabled")
          : I18n.t("services.serviceNotEnabled")
    );
    const serviceName = pot.isLoading(potService)
      ? I18n.t("global.remoteStates.loading")
      : pot.isError(potService) || pot.isNone(potService)
        ? I18n.t("global.remoteStates.notAvailable")
        : potService.value.service_name;

    // whether last attempt to save the preferences failed
    const profileVersion = pot
      .toOption(this.props.profile)
      .mapNullable(_ => (_.has_profile ? _.version : null))
      .getOrElse(0 as NonNegativeInteger);

    return (
      <ListItemComponent
        title={serviceName}
        subTitle={pot.getOrElse(inboxEnabledLabel, "")}
        hasBadge={!this.props.isRead}
        onPress={onPress}
        onLongPress={this.props.onLongPress}
        hideSeparator={this.props.hideSeparator}
        style={styles.listItem}
        onSwitch={onSwitchTap}
        value={this.state.uiEnabledChannels.inbox}
        key={`switch-service-${profileVersion}`}
        isLongPressModeEnabled={isLongPressModeEnabled}
      />
    );
  }
}
