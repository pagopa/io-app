import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { Access } from "../../../../../definitions/fims_history/Access";
import { potFoldWithDefault } from "../../../../utils/pot";
import { useAutoFetchingServiceByIdPot } from "../../common/hooks";
import {
  FimsHistoryFailureListItem,
  FimsHistorySuccessListItem
} from "./FimsHistoryListItems";
import { LoadingFimsHistoryListItem } from "./FimsHistoryLoaders";

type BaseHistoryListItemProps = {
  item: Access;
};

export const FimsHistoryListItemPicker = ({
  item
}: BaseHistoryListItemProps) => {
  const serviceData = useAutoFetchingServiceByIdPot(
    item.service_id as ServiceId
  );

  return potFoldWithDefault(serviceData, {
    default: LoadingFimsHistoryListItem,
    noneError: _ => <FimsHistoryFailureListItem item={item} />,
    some: data => (
      <FimsHistorySuccessListItem serviceData={data} consent={item} />
    ),
    someError: data => (
      <FimsHistorySuccessListItem serviceData={data} consent={item} />
    ),
    someLoading: data => (
      <FimsHistorySuccessListItem serviceData={data} consent={item} />
    )
  });
};
