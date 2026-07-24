import {
  BodySmall,
  Caption,
  H6,
  HSpacer,
  Icon,
  IOListItemStyles,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { Access } from "../../../../../definitions/fims_history/Access";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { FimsHistorySharedStyles } from "../utils/styles";

// ------- TYPES

export type FimsHistoryBaseListItemProps = {
  item: Access;
};
export type FimsHistorySuccessListItemProps = {
  consent: Access;
  serviceData: ServiceDetails;
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
        <Icon name="calendar" size={16} />
        <HSpacer size={4} />
        <Caption color={theme["textBody-tertiary"]}>
          {dateToAccessibilityReadableFormat(
            consent.timestamp,
            // eslint-disable-next-line i18next/no-literal-string -- date format token, not user-facing copy
            "DD/MM/YYYY, HH:mm"
          )}
        </Caption>
      </View>

      <VSpacer size={8} />

      <H6>{serviceData.organization.name}</H6>
      {/* TODO: Dark mode: Replace with theme values */}
      <BodySmall color="grey-700" weight="Regular">
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
          <Icon color="grey-300" name="calendar" size={16} />
          <HSpacer size={4} />
          <Caption color={theme["textBody-tertiary"]}>
            {}
            {/* eslint-disable-next-line i18next/no-literal-string -- date format token, not user-facing copy */}
            {dateToAccessibilityReadableFormat(item.timestamp, "DD,MM,YYYY")}
          </Caption>
        </View>
        <VSpacer size={4} />
        {/* TODO: Dark mode: Replace with theme values */}
        <BodySmall color="error-600" weight="Semibold">
          {I18n.t("FIMS.history.errorStates.dataUnavailable")}
        </BodySmall>
      </View>
      {/* TODO: Dark mode: Replace with theme values */}
      <Icon color="error-600" name="errorFilled" />
    </View>
  );
};

// ------------ STYLES

const defaultListItemStyles = [
  IOListItemStyles.listItem,
  FimsHistorySharedStyles.fixedHeightListItem
];
