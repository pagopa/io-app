import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { debounce } from "lodash";
import { Item } from "native-base";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { View, Keyboard, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { OfflineMerchant } from "../../../../../../definitions/cgn/merchants/OfflineMerchant";
import { OnlineMerchant } from "../../../../../../definitions/cgn/merchants/OnlineMerchant";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { LabelledItem } from "../../../../../components/LabelledItem";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  getValueOrElse,
  isLoading,
  isReady
} from "../../../bpd/model/RemoteValue";
import CgnMerchantsListView from "../../components/merchants/CgnMerchantsListView";
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

  React.useEffect(initLoadingLists, [initLoadingLists]);

  const onItemPress = (id: Merchant["id"]) => {
    props.navigateToMerchantDetail(id);
    Keyboard.dismiss();
  };

  return (
    <BaseScreenComponent
      goBack
      headerTitle={I18n.t("bonus.cgn.merchantsList.navigationTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        {isReady(props.onlineMerchants) || isReady(props.offlineMerchants) ? (
          <>
            <View style={IOStyles.horizontalContentPadding}>
              <H1>{I18n.t("bonus.cgn.merchantsList.screenTitle")}</H1>
              <Item>
                <LabelledItem
                  icon={"io-search"}
                  iconPosition={"right"}
                  inputProps={{
                    value: searchValue,
                    autoFocus: false,
                    onChangeText: setSearchValue,
                    placeholder: I18n.t("global.buttons.search")
                  }}
                />
              </Item>
            </View>
            <CgnMerchantsListView
              refreshing={
                isLoading(props.onlineMerchants) ||
                isLoading(props.offlineMerchants)
              }
              onRefresh={initLoadingLists}
              merchantList={merchantList}
              onItemPress={onItemPress}
            />
          </>
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
    </BaseScreenComponent>
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
