import * as pot from "@pagopa/ts-commons/lib/pot";
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
  }
});

const NewServiceListItem = (props: Props): React.ReactElement => {
  const potService = props.item;
  const onPress = pot.toUndefined(
    pot.map(potService, service => () => props.onSelect(service))
  );

  const serviceName = pot.fold(
    potService,
    () => I18n.t("global.remoteStates.loading"),
    () => I18n.t("global.remoteStates.loading"),
    () => I18n.t("global.remoteStates.notAvailable"),
    () => I18n.t("global.remoteStates.notAvailable"),
    service => service.service_name,
    () => I18n.t("global.remoteStates.loading"),
    service => service.service_name,
    () => I18n.t("global.remoteStates.notAvailable")
  );

  return (
    <ListItemComponent
      accessibilityRole={"button"}
      title={serviceName}
      hasBadge={false} // disabled for these reasons https://www.pivotaltracker.com/story/show/176919053
      onPress={onPress}
      hideSeparator={props.hideSeparator}
      style={styles.listItem}
      testID={serviceName}
    />
  );
};

export default NewServiceListItem;
