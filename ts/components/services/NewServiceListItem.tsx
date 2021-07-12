import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";

import { ProfileState } from "../../store/reducers/profile";
import customVariables from "../../theme/variables";
import { getEnabledChannelsForService } from "../../utils/profile";
import ListItemComponent from "../screens/ListItemComponent";

interface State {
  switchValue: boolean;
}

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
  constructor(props: Props) {
    super(props);
    const switchValue = this.isInboxChannelEnabled();
    this.state = {
      switchValue
    };
  }

  public componentDidUpdate() {
    const switchValue = this.isInboxChannelEnabled();
    if (
      switchValue !== this.state.switchValue &&
      !pot.isUpdating(this.props.profile)
    ) {
      this.setState({
        switchValue
      });
    }
  }

  private getServiceKey = (potService: pot.Pot<ServicePublic, Error>): string =>
    pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version || 0}`
      ),
      `service-switch`
    );

  private isInboxChannelEnabled() {
    const potService = this.props.item;
    const uiEnabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );
    return pot.isSome(uiEnabledChannels) && uiEnabledChannels.value.inbox;
  }

  public render() {
    const { switchValue } = this.state;
    const potService = this.props.item;

    const onPress = pot.toUndefined(
      pot.map(potService, service => () => this.props.onSelect(service))
    );

    const serviceName = pot.isLoading(potService)
      ? I18n.t("global.remoteStates.loading")
      : pot.isError(potService) || pot.isNone(potService)
      ? I18n.t("global.remoteStates.notAvailable")
      : potService.value.service_name;

    return (
      <ListItemComponent
        title={serviceName}
        hasBadge={false} // disabled for these reasons https://www.pivotaltracker.com/story/show/176919053
        onPress={onPress}
        hideSeparator={this.props.hideSeparator}
        style={styles.listItem}
        switchValue={switchValue}
        switchDisabled={pot.isUpdating(this.props.profile)}
        keySwitch={this.getServiceKey(potService)}
      />
    );
  }
}
