import * as React from "react";
import { useMemo } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
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
import {
  getValueOrElse,
  isError,
  isLoading
} from "../../../bpd/model/RemoteValue";
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
import { H1 } from "../../../../../components/core/typography/H1";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import GenericErrorComponent from "../../../../../components/screens/GenericErrorComponent";
import { MerchantsAll } from "./CgnMerchantsListScreen";

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 5,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: IOColors.white,
    top: -20
  }
});

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

  const categoryFilter = currentCategory
    ? {
        productCategories: [currentCategory]
      }
    : {};

  const initLoadingLists = () => {
    dispatch(cgnOfflineMerchants.request(categoryFilter));
    dispatch(cgnOnlineMerchants.request(categoryFilter));
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
      merchantID: id
    });
  };

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t(
        fromNullable(categorySpecs).fold(
          "bonus.cgn.merchantsList.navigationTitle",
          cs => cs.nameKey
        )
      )}
      contextualHelp={emptyContextualHelp}
    >
      {categorySpecs && (
        <LinearGradient
          useAngle={true}
          angle={57.23}
          colors={categorySpecs.colors}
          style={[
            IOStyles.horizontalContentPadding,
            {
              paddingTop: 16,
              paddingBottom: 32
            }
          ]}
        >
          <View style={[IOStyles.row, { alignItems: "center" }]}>
            <H1 color={"white"} style={[IOStyles.flex, { paddingRight: 30 }]}>
              {I18n.t(categorySpecs.nameKey)}
            </H1>
            {categorySpecs.icon({
              width: 57,
              height: 57,
              fill: IOColors.white,
              style: { justifyContent: "flex-end" }
            })}
          </View>
        </LinearGradient>
      )}
      {isError(onlineMerchants) && isError(offlineMerchants) ? (
        <SafeAreaView style={IOStyles.flex}>
          <GenericErrorComponent onRetry={initLoadingLists} />
        </SafeAreaView>
      ) : (
        <View style={[IOStyles.flex, styles.listContainer]}>
          <CgnMerchantsListView
            merchantList={merchantsAll}
            onItemPress={onItemPress}
            onRefresh={initLoadingLists}
            refreshing={
              isLoading(onlineMerchants) || isLoading(offlineMerchants)
            }
          />
        </View>
      )}
    </BaseScreenComponent>
  );
};

export default CgnMerchantsListByCategory;
