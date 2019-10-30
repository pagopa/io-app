import I18n from "i18n-js";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

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
  onItemSwitchValueChanged?: (service: ServicePublic, value: boolean) => void;
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
    const potService = this.props.item;
    const uiEnabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );
    const switchValue =
      pot.isSome(uiEnabledChannels) && uiEnabledChannels.value.inbox;
    this.state = {
      switchValue
    };
  }

  public componentDidUpdate() {
    const potService = this.props.item;
    const uiEnabledChannels = pot.map(potService, service =>
      getEnabledChannelsForService(this.props.profile, service.service_id)
    );
    const switchValue =
      pot.isSome(uiEnabledChannels) && uiEnabledChannels.value.inbox;
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

  private onItemSwitchValueChanged(value: boolean) {
    const potService = this.props.item;
    return this.props.onItemSwitchValueChanged
      ? pot.toUndefined(
          pot.map(potService, service => {
            if (
              this.props.onItemSwitchValueChanged &&
              !pot.isUpdating(this.props.profile)
            ) {
              this.setState({
                switchValue: value
              });
              this.props.onItemSwitchValueChanged(service, value);
            }
          })
        )
      : undefined;
  }

  // tslint:disable-next-line:cognitive-complexity
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
        onSwitchValueChanged={(value: boolean) =>
          this.onItemSwitchValueChanged(value)
        }
        switchValue={switchValue}
        switchDisabled={pot.isUpdating(this.props.profile)}
        keySwitch={this.getServiceKey(potService)}
        isLongPressEnabled={this.props.isLongPressEnabled}
      />
    );
  }
}
