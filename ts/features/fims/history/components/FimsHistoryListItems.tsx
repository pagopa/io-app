import {
  BodySmall,
  Caption,
  H6,
  HSpacer,
  Icon,
  IOListItemStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "i18next";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { Access } from "../../../../../definitions/fims_history/Access";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { FimsHistorySharedStyles } from "../utils/styles";

// ------- TYPES

export type FimsHistorySuccessListItemProps = {
  serviceData: ServiceDetails;
  consent: Access;
};
export type FimsHistoryBaseListItemProps = {
  item: Access;
};

// --------- LISTITEMS

export const FimsHistorySuccessListItem = ({
  serviceData,
  consent
}: FimsHistorySuccessListItemProps) => {
  const theme = useIOTheme();

  return (
    <View style={defaultListItemStyles}>
      <View style={{ flexDirection: "row" }}>
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

      <H6>{serviceData.organization.name}</H6>
      {/* TODO: Dark mode: Replace with theme values */}
      <BodySmall weight="Regular" color="grey-700">
        {consent.redirect?.display_name}
      </BodySmall>
    </View>
  );
};

export const FimsHistoryFailureListItem = ({
  item
}: FimsHistoryBaseListItemProps) => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        defaultListItemStyles,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }
      ]}
    >
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
        {/* TODO: Dark mode: Replace with theme values */}
        <BodySmall weight="Semibold" color="error-600">
          {I18n.t("FIMS.history.errorStates.dataUnavailable")}
        </BodySmall>
      </View>
      {/* TODO: Dark mode: Replace with theme values */}
      <Icon name="errorFilled" color="error-600" />
    </View>
  );
};

// ------------ STYLES

const defaultListItemStyles = [
  IOListItemStyles.listItem,
  FimsHistorySharedStyles.fixedHeightListItem
];
