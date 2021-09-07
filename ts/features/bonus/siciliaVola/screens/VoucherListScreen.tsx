import * as React from "react";
import { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { FlatList, SafeAreaView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import { GlobalState } from "../../../../store/reducers/types";
import I18n from "../../../../i18n";
import { constNull } from "fp-ts/lib/function";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../components/ui/LightModal";
import SvVoucherListFilters from "../components/SvVoucherListFilters";
import {
  svPossibleVoucherStateGet,
  svRequestVoucherPage,
  svResetFilter
} from "../store/actions/voucherList";
import ListItemComponent from "../../../../components/screens/ListItemComponent";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { svVouchersSelector } from "../store/reducers/voucherList/vouchers";
import { toArray } from "../../../../store/helpers/indexer";
import { formatDateAsLocal } from "../../../../utils/dates";
import { View } from "native-base";
import {
  FilterState,
  svFiltersSelector
} from "../store/reducers/voucherList/filters";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;
let foo = 1;
const VoucherListScreen = (props: Props): React.ReactElement => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);

  const vouchers = toArray(props.indexedVouchers);
  useEffect(() => {
    props.requestVoucherState();
    props.resetFilter();
  }, []);

  const openFiltersModal = () =>
    showAnimatedModal(
      // TODO replace onConfirm function when the search functionalities are defined
      <SvVoucherListFilters onClose={hideModal} onConfirm={constNull} />,
      BottomTopAnimation
    );

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
      isSearchAvailable={{ enabled: true, onSearchTap: openFiltersModal }}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherListScreen"}>
        <H1>{I18n.t("bonus.sv.voucherList.title")}</H1>
        <View spacer />
        <FlatList
          style={[IOStyles.horizontalContentPadding]}
          data={vouchers}
          keyExtractor={v => v.idVoucher.toString()}
          ItemSeparatorComponent={() => (
            <ItemSeparatorComponent noPadded={true} />
          )}
          onEndReached={() => {
            if (foo < 5) {
              props.requestVoucherPage({});
              foo++;
            }
          }}
          onEndReachedThreshold={0}
          renderItem={v => (
            <ListItemComponent
              title={v.item.destination}
              subTitle={formatDateAsLocal(v.item.departureDate, true, true)}
              onPress={() => true}
            />
          )}
          scrollEnabled={true}
          keyboardShouldPersistTaps={"handled"}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestVoucherState: () => dispatch(svPossibleVoucherStateGet.request()),
  resetFilter: () => dispatch(svResetFilter({})),
  requestVoucherPage: (filters: FilterState) =>
    dispatch(svRequestVoucherPage(filters))
});
const mapStateToProps = (state: GlobalState) => ({
  indexedVouchers: svVouchersSelector(state),
  filters: svFiltersSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(VoucherListScreen);
