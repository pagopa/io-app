import {
  Caption,
  H6,
  HSpacer,
  Icon,
  IOListItemStyles,
  IOStyles,
  BodySmall,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { Access } from "../../../../../definitions/fims_history/Access";
import I18n from "../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { potFoldWithDefault } from "../../../../utils/pot";
import { useAutoFetchingServiceByIdPot } from "../../common/hooks";
import { FimsHistorySharedStyles } from "../utils/styles";
import { LoadingFimsHistoryListItem } from "./FimsHistoryLoaders";

// ------- TYPES

type SuccessListItemProps = {
  serviceData: ServicePublic;
  consent: Access;
};
type BaseHistoryListItemProps = {
  item: Access;
};

// --------- LISTITEMS

const SuccessListItem = ({ serviceData, consent }: SuccessListItemProps) => {
  const theme = useIOTheme();

  return (
    <View style={defaultListItemStyles}>
      <View style={IOStyles.row}>
        <Icon size={16} name="calendar" />
        <HSpacer size={4} />
        <Caption color={theme["textBody-tertiary"]}>
          {dateToAccessibilityReadableFormat(
            consent.timestamp,
            "DD/MM/YYYY, HH:mm"
          )}
        </Caption>
      </View>

      <VSpacer size={8} />

      <H6>{serviceData.organization_name}</H6>
      <BodySmall weight="Regular" color="grey-700">
        {consent.redirect?.display_name}
      </BodySmall>
    </View>
  );
};

const FailureListItem = ({ item }: BaseHistoryListItemProps) => {
  const theme = useIOTheme();

  return (
    <View style={[defaultListItemStyles, styles.errorSpaceBetween]}>
      <View
        style={{
          paddingVertical: 15
        }}
      >
        <View
          style={{
            alignSelf: "flex-start",
            flexDirection: "row"
          }}
        >
          <Icon name="calendar" size={16} color="grey-300" />
          <HSpacer size={4} />
          <Caption color={theme["textBody-tertiary"]}>
            {dateToAccessibilityReadableFormat(item.timestamp, "DD,MM,YYYY")}
          </Caption>
        </View>
        <VSpacer size={4} />
        <BodySmall weight="Semibold" color="error-600">
          {I18n.t("FIMS.history.errorStates.dataUnavailable")}
        </BodySmall>
      </View>
      <Icon name="errorFilled" color="error-600" />
    </View>
  );
};

// ------- RENDERER

export const FimsHistoryListItem = ({ item }: BaseHistoryListItemProps) => {
  const serviceData = useAutoFetchingServiceByIdPot(
    item.service_id as ServiceId
  );

  return potFoldWithDefault(serviceData, {
    default: LoadingFimsHistoryListItem,
    noneError: _ => <FailureListItem item={item} />,
    some: data => <SuccessListItem serviceData={data} consent={item} />,
    someError: data => <SuccessListItem serviceData={data} consent={item} />,
    someLoading: data => <SuccessListItem serviceData={data} consent={item} />
  });
};

// ------------ STYLES

const styles = StyleSheet.create({
  errorSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const defaultListItemStyles = [
  IOListItemStyles.listItem,
  FimsHistorySharedStyles.fixedHeightListItem
];
