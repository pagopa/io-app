import { Divider, ListItemNav, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import { idPayGenerateBarcode } from "../../barcode/store/actions";
import { IDPayPaymentRoutes } from "../../payment/navigation/navigator";
import {
  idpayOperationListSelector,
  idpayPaginatedTimelineSelector,
  idpayTimelineCurrentPageSelector,
  idpayTimelineIsLastPageSelector,
  idpayTimelineLastUpdateSelector
} from "../store";
import { idpayTimelinePageGet } from "../store/actions";

export const useInitiativeTimelineFetcher = (
  initiativeId: string,
  pageSize: number,
  onError: () => void
) => {
  const dispatch = useIODispatch();

  const paginatedTimelinePot = useIOSelector(idpayPaginatedTimelineSelector);
  const isLastPage = useIOSelector(idpayTimelineIsLastPageSelector);
  const currentPage = useIOSelector(idpayTimelineCurrentPageSelector);
  const lastUpdate = useIOSelector(idpayTimelineLastUpdateSelector);

  const timeline = useIOSelector(idpayOperationListSelector);

  const isLoading = pot.isLoading(paginatedTimelinePot);
  const isUpdating = pot.isUpdating(paginatedTimelinePot);
  const isError = pot.isError(paginatedTimelinePot);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (currentPage >= 0 && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [currentPage, isRefreshing]);

  const refresh = () => {
    if (!isLoading) {
      setIsRefreshing(true);
      fetchPage(0);
    }
  };

  const fetchPage = (page: number) =>
    !isUpdating &&
    !isLoading &&
    dispatch(
      idpayTimelinePageGet.request({
        initiativeId,
        page,
        pageSize
      })
    );

  const fetchNextPage = () => {
    if (isLastPage || isLoading) {
      return;
    }
    if (isError) {
      onError();
    } else {
      fetchPage(currentPage + 1);
    }
  };

  const retryFetchLastPage = () => {
    fetchPage(currentPage);
  };

  return {
    isLoading,
    isUpdating,
    isRefreshing,
    timeline,
    fetchPage,
    refresh,
    fetchNextPage,
    retryFetchLastPage,
    currentPage,
    lastUpdate
  } as const;
};

export const useIdpayDiscountDetailsBottomSheet = (initiativeId: string) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const navigateToPaymentAuthorization = () => {
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN);
  };
  const dispatch = useIODispatch();
  const barcodePressHandler = () => {
    dispatch(idPayGenerateBarcode.request({ initiativeId }));
    bottomSheet.dismiss();
  };

  const DiscountInitiativeBottomSheetContent = () => (
    <>
      <ListItemNav
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
        icon="qrCode"
        onPress={() => {
          bottomSheet.dismiss();
          navigateToPaymentAuthorization();
        }}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.scanQr"
        )}
      />
      <Divider />
      <ListItemNav
        icon="barcode"
        value={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
        onPress={barcodePressHandler}
        accessibilityLabel={I18n.t(
          "idpay.initiative.discountDetails.bottomSheetOptions.generateBarcode"
        )}
      />
      <Divider />
      <VSpacer size={24} />
    </>
  );

  const bottomSheet = useIOBottomSheetAutoresizableModal({
    component: <DiscountInitiativeBottomSheetContent />,
    title: null
  });

  return bottomSheet;
};
