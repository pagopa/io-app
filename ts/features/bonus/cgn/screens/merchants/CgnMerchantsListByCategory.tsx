import * as React from "react";
import { useMemo } from "react";
import { SafeAreaView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { View } from "native-base";
import { fromNullable } from "fp-ts/lib/Option";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants
} from "../../store/actions/merchants";
import { cgnSelectedCategorySelector } from "../../store/reducers/categories";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import CgnMerchantsListView from "../../components/merchants/CgnMerchantsListView";
import { getValueOrElse, isLoading } from "../../../bpd/model/RemoteValue";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import {
  cgnOfflineMerchantsSelector,
  cgnOnlineMerchantsSelector
} from "../../store/reducers/merchants";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { useNavigationContext } from "../../../../../utils/hooks/useOnFocus";
import CGN_ROUTES from "../../navigation/routes";
import { getCategorySpecs } from "../../utils/filters";
import { MerchantsAll } from "./CgnMerchantsListScreen";

const CgnMerchantsListByCategory = () => {
  const dispatch = useIODispatch();
  const currentCategory = useIOSelector(cgnSelectedCategorySelector);
  const onlineMerchants = useIOSelector(cgnOnlineMerchantsSelector);
  const offlineMerchants = useIOSelector(cgnOfflineMerchantsSelector);

  const categorySpecs = useMemo(
    () =>
      fromNullable(currentCategory).fold(undefined, cat =>
        getCategorySpecs(cat).fold(undefined, c => c)
      ),
    [currentCategory]
  );

  const navigation = useNavigationContext();

  const initLoadingLists = () => {
    dispatch(
      cgnOfflineMerchants.request(
        currentCategory
          ? {
              productCategories: [currentCategory]
            }
          : {}
      )
    );
    dispatch(
      cgnOnlineMerchants.request(
        currentCategory
          ? {
              productCategories: [currentCategory]
            }
          : {}
      )
    );
  };

  React.useEffect(initLoadingLists, [currentCategory]);

  // Mixes online and offline merchants to render on the same list
  // merchants are sorted by name
  const merchantsAll = useMemo(() => {
    const onlineMerchantsValue = getValueOrElse(onlineMerchants, []);
    const offlineMerchantsValue = getValueOrElse(offlineMerchants, []);

    const merchantsAll = [...onlineMerchantsValue, ...offlineMerchantsValue];

    // Removes possible duplicated merchant:
    // a merchant can be both online and offline, or may have multiple result by offlineMerchant search API
    const uniquesMerchants = [
      ...new Map<OfflineMerchant["id"] | OnlineMerchant["id"], MerchantsAll>(
        merchantsAll.map(m => [m.id, m])
      ).values()
    ];

    return [...uniquesMerchants].sort((m1: MerchantsAll, m2: MerchantsAll) =>
      m1.name.localeCompare(m2.name)
    );
  }, [onlineMerchants, offlineMerchants]);

  const onItemPress = (id: Merchant["id"]) => {
    navigation.navigate(CGN_ROUTES.DETAILS.MERCHANTS.DETAIL, {
      id
    });
  };

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {categorySpecs && (
          <LinearGradient
            useAngle={true}
            angle={57.23}
            colors={categorySpecs.colors}
          >
            <View
              style={[IOStyles.horizontalContentPadding, { height: 149 }]}
            />
          </LinearGradient>
        )}
        <CgnMerchantsListView
          merchantList={merchantsAll}
          onItemPress={onItemPress}
          onRefresh={initLoadingLists}
          refreshing={isLoading(onlineMerchants) || isLoading(offlineMerchants)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export default CgnMerchantsListByCategory;
