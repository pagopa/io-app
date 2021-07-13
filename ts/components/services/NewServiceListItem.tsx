import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import ListItemComponent from "../screens/ListItemComponent";

type Props = {
  item: pot.Pot<ServicePublic, Error>;
  onSelect: (service: ServicePublic) => void;
  hideSeparator: boolean;
};

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

const NewServiceListItem = (props: Props): React.ReactElement => {
  const getServiceKey = (potService: pot.Pot<ServicePublic, Error>): string =>
    pot.getOrElse(
      pot.map(
        potService,
        service => `${service.service_id}-${service.version || 0}`
      ),
      `service-switch`
    );

  const potService = props.item;

  const onPress = pot.toUndefined(
    pot.map(potService, service => () => props.onSelect(service))
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
      hideSeparator={props.hideSeparator}
      style={styles.listItem}
      keySwitch={getServiceKey(potService)}
    />
  );
};

export default NewServiceListItem;
