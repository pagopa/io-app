import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import EmptyListImage from "../../../../../../img/bonus/siciliaVola/emptyVoucherList.svg";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import ItemSeparatorComponent from "../../../../../components/ItemSeparatorComponent";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../../../../components/screens/ListItemComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../components/ui/LightModal";
import I18n from "../../../../../i18n";
import { toArray } from "../../../../../store/helpers/indexer";
import { useIODispatch } from "../../../../../store/hooks";
import { GlobalState } from "../../../../../store/reducers/types";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  isError,
  isLoading,
  isReady,
  isUndefined
} from "../../../bpd/model/RemoteValue";
import SvVoucherListFilters from "../../components/SvVoucherListFilters";
import SV_ROUTES from "../../navigation/routes";
import { svGenerateVoucherStart } from "../../store/actions/voucherGeneration";
import {
  svPossibleVoucherStateGet,
  svSelectVoucher,
  svSetFilter,
  svVoucherListGet
} from "../../store/actions/voucherList";
import { selectedVoucherRevocationStateSelector } from "../../store/reducers/selectedVoucher";
import {
  FilterState,
  svFiltersSelector
} from "../../store/reducers/voucherList/filters";
import { possibleVoucherStateSelector } from "../../store/reducers/voucherList/possibleVoucherState";
import {
  svRequiredDataLoadedSelector,
  svVouchersListUiSelector
} from "../../store/reducers/voucherList/ui";
import { svVouchersSelector } from "../../store/reducers/voucherList/vouchers";
import { VoucherPreview } from "../../types/SvVoucherResponse";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const RenderItemBase = (voucher: VoucherPreview): React.ReactElement => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();

  return (
    <ListItemComponent
      title={voucher.destination}
      subTitle={formatDateAsLocal(voucher.departureDate, true, true)}
      onPress={() => {
        dispatch(svSelectVoucher(voucher.idVoucher));
        navigation.navigate(SV_ROUTES.VOUCHER_LIST.DETAILS);
      }}
    />
  );
};

/**
 * In order to optimize the rendering of the item, we use the idVoucher as unique identifier to avoid to redraw the component.
 * The VoucherPreview data cannot change while consulting the list and we use this information to avoid a deep comparison
 */
export const RenderItem = React.memo(
  RenderItemBase,
  (prev: VoucherPreview, curr: VoucherPreview) =>
    prev.idVoucher === curr.idVoucher
);

/**
 * Loading item, placed in the footer during the loading of the next page
 * @constructor
 */
const FooterLoading = () => (
  <>
    <VSpacer size={16} />
    <ActivityIndicator
      color={"black"}
      accessible={false}
      importantForAccessibility={"no-hide-descendants"}
      accessibilityElementsHidden={true}
      testID={"activityIndicator"}
    />
  </>
);
const EmptyVoucherList = () => {
  const dispatch = useIODispatch();

  return (
    <>
      <InfoScreenComponent
        image={<EmptyListImage width={104} height={104} />}
        title={I18n.t("bonus.sv.voucherList.emptyList.title")}
        body={I18n.t("bonus.sv.voucherList.emptyList.subtitle")}
      />
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={confirmButtonProps(
          () => dispatch(svGenerateVoucherStart()),
          I18n.t("bonus.sv.voucherList.emptyList.cta")
        )}
      />
    </>
  );
};

const VoucherListScreen = (props: Props): React.ReactElement => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);
  const {
    requestVoucherState,
    resetFilter,
    filters,
    requestVoucherPage,
    revocationState
  } = props;

  const [isFirstPageLoadedSuccessfully, setIsFirstPageLoadedSuccessfully] =
    useState<boolean>(false);

  const vouchers = toArray(props.indexedVouchers);
  const isDataLoadedUndefined = isUndefined(props.requiredDataLoaded);
  const isDataLoadedLoading = isLoading(props.requiredDataLoaded);
  const isDataLoadedError = isError(props.requiredDataLoaded);

  useEffect(() => {
    requestVoucherState();
    resetFilter();
  }, [requestVoucherState, resetFilter]);

  useEffect(() => {
    if (isDataLoadedUndefined) {
      setIsFirstPageLoadedSuccessfully(false);
      requestVoucherPage(filters);
    }
  }, [filters, isDataLoadedUndefined, requestVoucherPage]);

  useEffect(() => {
    if (isDataLoadedError && isFirstPageLoadedSuccessfully) {
      showToast(I18n.t("bonus.sv.voucherList.error"), "danger");
    }
  }, [isDataLoadedError, isFirstPageLoadedSuccessfully]);

  useEffect(() => {
    if (isReady(revocationState)) {
      showToast(
        I18n.t("bonus.sv.voucherList.details.voucherRevocation.toast.ok"),
        "success"
      );
    }
  }, [revocationState]);

  const openFiltersModal = () =>
    showAnimatedModal(
      <SvVoucherListFilters onClose={hideModal} onConfirm={hideModal} />,
      BottomTopAnimation
    );

  if (
    !isReady(props.possibleVoucherState) ||
    ((isDataLoadedError || isDataLoadedLoading) &&
      !isFirstPageLoadedSuccessfully)
  ) {
    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={emptyContextualHelp}
        headerTitle={I18n.t("bonus.sv.headerTitle")}
      >
        <LoadingErrorComponent
          isLoading={
            isLoading(props.possibleVoucherState) || isDataLoadedLoading
          }
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={() => {
            if (isDataLoadedError) {
              props.requestVoucherPage(props.filters);
            }
            if (isError(props.possibleVoucherState)) {
              props.requestVoucherState();
            }
          }}
        />
      </BaseScreenComponent>
    );
  }
  if (!isFirstPageLoadedSuccessfully) {
    setIsFirstPageLoadedSuccessfully(true);
  }

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
      isSearchAvailable={{
        enabled: true,
        onSearchTap: openFiltersModal
      }}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherListScreen"}>
        <>
          <H1 style={IOStyles.horizontalContentPadding}>
            {I18n.t("bonus.sv.voucherList.title")}
          </H1>
          <VSpacer size={16} />

          {isReady(props.requiredDataLoaded) && vouchers.length === 0 ? (
            <EmptyVoucherList />
          ) : (
            <FlatList
              style={IOStyles.horizontalContentPadding}
              data={vouchers}
              ListFooterComponent={
                isLoading(props.requiredDataLoaded) && <FooterLoading />
              }
              keyExtractor={v => v.idVoucher.toString()}
              ItemSeparatorComponent={() => (
                <ItemSeparatorComponent noPadded={true} />
              )}
              onEndReached={() => {
                if (props.uiParameters.nextPage !== undefined) {
                  props.requestVoucherPage(props.filters);
                }
              }}
              renderItem={v => (
                <RenderItem
                  idVoucher={v.item.idVoucher}
                  departureDate={v.item.departureDate}
                  destination={v.item.destination}
                />
              )}
              scrollEnabled={true}
              keyboardShouldPersistTaps={"handled"}
            />
          )}
        </>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  requestVoucherState: () => dispatch(svPossibleVoucherStateGet.request()),
  resetFilter: () => dispatch(svSetFilter({})),
  requestVoucherPage: (filters: FilterState) =>
    dispatch(svVoucherListGet.request(filters))
});
const mapStateToProps = (state: GlobalState) => ({
  indexedVouchers: svVouchersSelector(state),
  filters: svFiltersSelector(state),
  requiredDataLoaded: svRequiredDataLoadedSelector(state),
  uiParameters: svVouchersListUiSelector(state),
  possibleVoucherState: possibleVoucherStateSelector(state),
  revocationState: selectedVoucherRevocationStateSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(VoucherListScreen);
