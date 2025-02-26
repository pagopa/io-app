import {
  ContentWrapper,
  Divider,
  ListItemHeader
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { FunctionComponent, useCallback, useMemo } from "react";
import { FlatList, RefreshControl, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../../../common/model/RemoteValue";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { CgnMerchantListViewRenderItem } from "../../components/merchants/CgnMerchantsListView";
import CGN_ROUTES from "../../navigation/routes";
import {
  cgnOfflineMerchants,
  cgnOnlineMerchants
} from "../../store/actions/merchants";
import {
  cgnOfflineMerchantsSelector,
  cgnOnlineMerchantsSelector
} from "../../store/reducers/merchants";
import { mixAndSortMerchants } from "../../utils/merchants";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

export type MerchantsAll = OfflineMerchant | OnlineMerchant;
/**
 * Screen that renders the list of the merchants which have an active discount for CGN
 * @param props
 * @constructor
 */
const CgnMerchantsListScreen: FunctionComponent<Props> = (props: Props) => {
  const navigator = useIONavigation();
  const { requestOfflineMerchants, requestOnlineMerchants } = props;
  // Mixes online and offline merchants to render on the same list
  // merchants are sorted by name
  const merchantsAll = useMemo(
    () =>
      mixAndSortMerchants(
        getValueOrElse(props.onlineMerchants, []),
        getValueOrElse(props.offlineMerchants, [])
      ),
    [props.onlineMerchants, props.offlineMerchants]
  );

  const initLoadingLists = useCallback(() => {
    requestOfflineMerchants();
    requestOnlineMerchants();
  }, [requestOfflineMerchants, requestOnlineMerchants]);

  useFocusEffect(initLoadingLists);

  const onItemPress = useCallback(
    (merchantID: Merchant["id"]) => {
      navigator.navigate(CGN_ROUTES.DETAILS.MAIN, {
        screen: CGN_ROUTES.DETAILS.MERCHANTS.DETAIL,
        params: { merchantID }
      });
    },
    [navigator]
  );

  const renderItem = useMemo(
    () => CgnMerchantListViewRenderItem({ onItemPress }),
    [onItemPress]
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      {!(isError(props.onlineMerchants) || isError(props.offlineMerchants)) && (
        <ContentWrapper>
          <ListItemHeader
            label={I18n.t("bonus.cgn.merchantsList.merchantsAll")}
          />
        </ContentWrapper>
      )}
      {isReady(props.onlineMerchants) && isReady(props.offlineMerchants) && (
        <FlatList
          data={merchantsAll}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider />}
          refreshControl={
            <RefreshControl
              refreshing={
                isLoading(props.onlineMerchants) ||
                isLoading(props.offlineMerchants)
              }
              onRefresh={initLoadingLists}
            />
          }
        />
      )}
      {(isError(props.onlineMerchants) || isError(props.offlineMerchants)) && (
        <OperationResultScreenContent
          title={I18n.t("wallet.payment.outcome.GENERIC_ERROR.title")}
          pictogram="umbrella"
          action={{
            label: I18n.t("global.buttons.retry"),
            onPress: initLoadingLists
          }}
        />
      )}
    </SafeAreaView>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  onlineMerchants: cgnOnlineMerchantsSelector(state),
  offlineMerchants: cgnOfflineMerchantsSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestOnlineMerchants: () => dispatch(cgnOnlineMerchants.request({})),
  requestOfflineMerchants: () => dispatch(cgnOfflineMerchants.request({}))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsListScreen);
