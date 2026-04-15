import { OfflineMerchant } from "../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../definitions/cgn/merchants/OnlineMerchant";
import { MerchantsAll } from "../screens/merchants/CgnMerchantsListScreen";
import { OnlineMerchants } from "../../../../../definitions/cgn/merchants/OnlineMerchants";
import { OfflineMerchants } from "../../../../../definitions/cgn/merchants/OfflineMerchants";

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
