import {
  Caption,
  HSpacer,
  Icon,
  LabelSmall,
  ListItemNav,
  PressableListItemBase,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import * as React from "react";
import { View } from "react-native";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { Consent } from "../../../../../definitions/fims/Consent";
import I18n from "../../../../i18n";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { potFoldWithDefault } from "../../../../utils/pot";
import { useAutoFetchingServiceByIdPot } from "../../common/utils/hooks";
import { LoadingFimsHistoryListItem } from "./FimsHistoryLoaders";

// ------- TYPES

type SuccessListItemProps = {
  serviceData: ServicePublic;
  consent: Consent;
};
type HistoryListItemProps = {
  item: Consent;
};

type FailureListItemProps = {
  consent: Consent;
};

// --------- LISTITEMS

const SuccessListItem = ({ serviceData, consent }: SuccessListItemProps) => (
  <ListItemNav
    onPress={constNull}
    value={serviceData.organization_name}
    topElement={{
      dateValue: dateToAccessibilityReadableFormat(consent.timestamp)
    }}
    description={consent.redirect?.display_name}
    hideChevron
  />
);

const FailureListItem = ({ consent }: FailureListItemProps) => {
  const theme = useIOTheme();

  return (
    <PressableListItemBase>
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
            {dateToAccessibilityReadableFormat(consent.timestamp)}
          </Caption>
        </View>
        <VSpacer size={4} />
        <LabelSmall weight="Semibold" color="error-600">
          {I18n.t("FIMS.history.errorStates.dataUnavailable")}
        </LabelSmall>
      </View>
      <Icon name="errorFilled" color="error-600" />
    </PressableListItemBase>
  );
};

// ------- RENDERER

export const FimsHistoryListItem = ({ item }: HistoryListItemProps) => {
  const { serviceData } = useAutoFetchingServiceByIdPot(
    item.service_id as ServiceId
  );

  return potFoldWithDefault(serviceData, {
    default: LoadingFimsHistoryListItem,
    noneError: _ => <FailureListItem consent={item} />,
    some: data => <SuccessListItem serviceData={data} consent={item} />,
    someError: data => <SuccessListItem serviceData={data} consent={item} />,
    someLoading: data => <SuccessListItem serviceData={data} consent={item} />
  });
};
