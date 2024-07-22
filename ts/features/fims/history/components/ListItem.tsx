import { ListItemNav } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { Consent } from "../../../../../definitions/fims/Consent";
import { dateToAccessibilityReadableFormat } from "../../../../utils/accessibility";
import { potFoldWithDefault } from "../../../../utils/pot";
import { useAutoFetchingServiceByIdPot } from "../../common/utils/hooks";
import { LoadingFimsHistoryListItem } from "../components/Loaders";

type SuccessListItemProps = {
  serviceData: ServicePublic;
  consent: Consent;
};
const SuccessListItem = ({ serviceData, consent }: SuccessListItemProps) => (
  <ListItemNav
    onPress={() => null}
    value={serviceData.organization_name}
    topElement={{
      dateValue: dateToAccessibilityReadableFormat(consent.timestamp)
    }}
    description={consent.redirect?.display_name}
    hideChevron
  />
);
type HistoryListItemProps = {
  item: Consent;
};

export const FimsHistoryListItem = ({ item }: HistoryListItemProps) => {
  const { serviceData } = useAutoFetchingServiceByIdPot(
    item.service_id as ServiceId
  );

  return potFoldWithDefault(serviceData, {
    default: LoadingFimsHistoryListItem,
    some: data => <SuccessListItem serviceData={data} consent={item} />,
    someError: data => <SuccessListItem serviceData={data} consent={item} />,
    someLoading: data => <SuccessListItem serviceData={data} consent={item} />
  });
};
