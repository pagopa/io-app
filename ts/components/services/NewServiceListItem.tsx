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
  onLongPress?: () => void;
  onItemSwitchValueChanged?: (
    services: ReadonlyArray<ServicePublic>,
    value: boolean
  ) => void;
  isLongPressEnabled: boolean;
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
    this.onItemSwitchValueChanged = this.onItemSwitchValueChanged.bind(this);
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

  private getServiceKey = (
    potService: pot.Pot<ServicePublic, Error>
  ): string => {
    return pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version || 0}`
      ),
      `service-switch`
    );
  };

  private isInboxChannelEnabled() {
    const potService = this.props.item;
    const uiEnabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );
    return pot.isSome(uiEnabledChannels) && uiEnabledChannels.value.inbox;
  }

  private onItemSwitchValueChanged(value: boolean) {
    const potService = this.props.item;
    if (this.props.onItemSwitchValueChanged !== undefined) {
      const onItemSwitchValueChanged = this.props.onItemSwitchValueChanged;
      pot.map(potService, service => {
        // if the service is not updating and the new value is
        // different from the old one, then update it!
        if (
          !pot.isUpdating(this.props.profile) &&
          this.state.switchValue !== value
        ) {
          this.setState({
            switchValue: value
          });
          onItemSwitchValueChanged([service], value);
        }
      });
    }
  }

  public render() {
    const { switchValue } = this.state;
    const potService = this.props.item;

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

    return (
      <ListItemComponent
        title={serviceName}
        hasBadge={!this.props.isRead}
        onPress={onPress}
        onLongPress={this.props.onLongPress}
        hideSeparator={this.props.hideSeparator}
        style={styles.listItem}
        isItemDisabled={!switchValue}
        onSwitchValueChanged={this.onItemSwitchValueChanged}
        switchValue={switchValue}
        switchDisabled={pot.isUpdating(this.props.profile)}
        keySwitch={this.getServiceKey(potService)}
        isLongPressEnabled={this.props.isLongPressEnabled}
      />
    );
  }
}
