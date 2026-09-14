import { OfflineMerchant } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchant";
import { OfflineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OfflineMerchants";
import { OnlineMerchant } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchant";
import { OnlineMerchants } from "@io-app/api-types/generated/definitions/cgn/merchants/OnlineMerchants";
import { useMemo } from "react";

import {
  getValueOrElse,
  isError,
  isReady,
  RemoteValue
} from "../../../../common/model/RemoteValue";
import { MerchantsAll } from "../screens/merchants/CgnMerchantsListScreen";

export const mixAndSortMerchants = (
  onlineMerchants: OnlineMerchants["items"],
  offlineMerchants: OfflineMerchants["items"]
) => {
  const merchantsAll = [...offlineMerchants, ...onlineMerchants];

  // Removes possible duplicated merchant:
  // a merchant can be both online and offline, or may have multiple result by offlineMerchant search API
  const uniquesMerchants = [
    ...new Map<OfflineMerchant["id"] | OnlineMerchant["id"], MerchantsAll>(
      merchantsAll.map(m => [m.id, m])
    ).values()
  ];

  const merchantsWithNewDiscounts = [...uniquesMerchants]
    .filter((m: MerchantsAll) => m.newDiscounts)
    .sort((m1: MerchantsAll, m2: MerchantsAll) =>
      m1.name.localeCompare(m2.name)
    );
  const merchantsWithoutNewDiscounts = [...uniquesMerchants]
    .filter((m: MerchantsAll) => !m.newDiscounts)
    .sort((m1: MerchantsAll, m2: MerchantsAll) =>
      m1.name.localeCompare(m2.name)
    );

  return [...merchantsWithNewDiscounts, ...merchantsWithoutNewDiscounts];
};

// Merges and sorts online/offline merchants once both requests have settled,
// preserving the ready source's data even if the other one has failed
export const useMixedSortedMerchants = (
  onlineMerchants: RemoteValue<OnlineMerchants["items"], unknown>,
  offlineMerchants: RemoteValue<OfflineMerchants["items"], unknown>
) => {
  const bothMerchantsSettled =
    (isReady(onlineMerchants) || isError(onlineMerchants)) &&
    (isReady(offlineMerchants) || isError(offlineMerchants));

  return useMemo(
    () =>
      bothMerchantsSettled
        ? mixAndSortMerchants(
            getValueOrElse(onlineMerchants, []),
            getValueOrElse(offlineMerchants, [])
          )
        : [],
    [bothMerchantsSettled, onlineMerchants, offlineMerchants]
  );
};
