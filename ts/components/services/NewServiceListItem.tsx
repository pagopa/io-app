import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { GestureResponderEvent } from "react-native";
import { ListItemNav } from "@pagopa/io-app-design-system";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";

type Props = {
  item: pot.Pot<ServicePublic, Error>;
  onSelect: (service: ServicePublic) => void;
  hideSeparator: boolean;
};

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
    <ListItemNav
      value={serviceName}
      onPress={onPress as (event: GestureResponderEvent) => void}
      testID={serviceName}
    />
  );
};

export default NewServiceListItem;
