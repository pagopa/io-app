import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { debounce } from "lodash";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { FlatList, Keyboard, RefreshControl, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { LoadingErrorComponent } from "../../../../../components/LoadingErrorComponent";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../../../common/model/RemoteValue";
import { CgnMerchantListViewRenderItem } from "../../components/merchants/CgnMerchantsListView";
import { navigateToCgnMerchantDetail } from "../../navigation/actions";
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

const DEBOUNCE_SEARCH: Millisecond = 300 as Millisecond;

export type MerchantsAll = OfflineMerchant | OnlineMerchant;
/**
 * Screen that renders the list of the merchants which have an active discount for CGN
 * @param props
 * @constructor
 */
const CgnMerchantsListScreen: React.FunctionComponent<Props> = (
  props: Props
) => {
  const [searchValue, setSearchValue] = React.useState("");
  const [merchantList, setMerchantsList] = React.useState<
    ReadonlyArray<MerchantsAll>
  >([]);

  const { navigateToMerchantDetail } = props;

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

  const performSearch = (
    text: string,
    merchantList: ReadonlyArray<MerchantsAll>
  ) => {
    // if search text is empty, restore the whole list
    if (text.length === 0) {
      setMerchantsList(merchantList);
      return;
    }
    const resultList = merchantList.filter(
      m => m.name.toLowerCase().indexOf(text.toLowerCase()) > -1
    );
    setMerchantsList(resultList);
  };

  const debounceRef = React.useRef(debounce(performSearch, DEBOUNCE_SEARCH));

  React.useEffect(() => {
    debounceRef.current(searchValue, merchantsAll);
  }, [
    searchValue,
    props.onlineMerchants,
    props.offlineMerchants,
    merchantsAll
  ]);

  const { requestOfflineMerchants, requestOnlineMerchants } = props;

  const initLoadingLists = useCallback(() => {
    requestOfflineMerchants();
    requestOnlineMerchants();
  }, [requestOfflineMerchants, requestOnlineMerchants]);

  useFocusEffect(initLoadingLists);

  const onItemPress = React.useCallback(
    (id: Merchant["id"]) => {
      navigateToMerchantDetail(id);
      Keyboard.dismiss();
    },
    [navigateToMerchantDetail]
  );

  const renderItem = React.useMemo(
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
          <TextInput
            accessibilityLabel={I18n.t("global.buttons.search")}
            icon="search"
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder={I18n.t("global.buttons.search")}
            autoFocus={false}
          />
          <VSpacer />
        </ContentWrapper>
      )}
      {isReady(props.onlineMerchants) || isReady(props.offlineMerchants) ? (
        <FlatList
          data={merchantList}
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
      ) : (
        <LoadingErrorComponent
          isLoading={
            isLoading(props.offlineMerchants) ||
            isLoading(props.onlineMerchants)
          }
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={initLoadingLists}
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
  requestOfflineMerchants: () => dispatch(cgnOfflineMerchants.request({})),
  navigateToMerchantDetail: (id: Merchant["id"]) =>
    navigateToCgnMerchantDetail({ merchantID: id })
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsListScreen);
