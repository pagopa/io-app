import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { getEnabledChannelsForService } from "../../screens/preferences/common";
import { ProfileState } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import ListItemComponent from "../screens/ListItemComponent";

type Props = Readonly<{
  item: pot.Pot<ServicePublic, Error>;
  profile: ProfileState;
  onSelect: (service: ServicePublic) => void;
  isRead: boolean;
  hideSeparator: boolean;
}>;

const styles = StyleSheet.create({
  listItem: {
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding
  }
});

export default class NewServiceListItem extends React.PureComponent<Props> {
  public render() {
    const potService = this.props.item;
    const onPress = pot.getOrElse(
      pot.map(potService, service => () => this.props.onSelect(service)),
      undefined
    );
    const enabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );

    const isServiceDisabled =
      pot.isSome(enabledChannels) && enabledChannels.value.inbox === false;

    const serviceName = pot.isLoading(potService)
      ? I18n.t("global.remoteStates.loading")
      : pot.isError(potService) || pot.isNone(potService)
        ? I18n.t("global.remoteStates.notAvailable")
        : potService.value.service_name;

    return (
      <ListItemComponent
        title={serviceName}
        hasBadge={!this.props.isRead}
        onPress={onPress}
        hideSeparator={this.props.hideSeparator}
        style={styles.listItem}
        isItemDisabled={isServiceDisabled}
      />
    );
  }
}
