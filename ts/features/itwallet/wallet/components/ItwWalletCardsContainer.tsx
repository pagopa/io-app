import { ListItemHeader, VSpacer, VStack } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback, useMemo } from "react";
import { useDebugInfo } from "../../../../hooks/useDebugInfo";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { WalletCardsCategoryContainer } from "../../../wallet/components/WalletCardsCategoryContainer";
import { selectWalletCardsByCategory } from "../../../wallet/store/selectors";
import { withWalletCategoryFilter } from "../../../wallet/utils";
import {
  ItwEidInfoBottomSheetContent,
  ItwEidInfoBottomSheetTitle
} from "../../common/components/ItwEidInfoBottomSheetContent";
import { ItwEidLifecycleAlert } from "../../common/components/ItwEidLifecycleAlert";
import { ItwUpgradeBanner } from "../../common/components/ItwUpgradeBanner.tsx";
import { ItwWalletReadyBanner } from "../../common/components/ItwWalletReadyBanner";
import { useItwPendingReviewRequest } from "../../common/hooks/useItwPendingReviewRequest";
import { useItwStatusIconColor } from "../../common/hooks/useItwStatusIconColor.ts";
import {
  itwShouldHideEidLifecycleAlert,
  itwShouldRenderNewItWalletSelector
} from "../../common/store/selectors";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils.ts";
import {
  itwCredentialsEidExpirationSelector,
  itwCredentialsEidStatusSelector
} from "../../credentials/store/selectors";
import { ITW_ROUTES } from "../../navigation/routes.ts";
import { ItwWalletIdStatus } from "./ItwWalletIdStatus.tsx";

const LIFECYCLE_STATUS: Array<ItwJwtCredentialStatus> = [
  "jwtExpiring",
  "jwtExpired"
];

export const ItwWalletCardsContainer = withWalletCategoryFilter("itw", () => {
  const isNewItwRenderable = useIOSelector(itwShouldRenderNewItWalletSelector);
  const shouldHideEidAlert = useIOSelector(itwShouldHideEidLifecycleAlert);
  const navigation = useIONavigation();
  const cards = useIOSelector(state =>
    selectWalletCardsByCategory(state, "itw")
  );
  const eidStatus = useIOSelector(itwCredentialsEidStatusSelector);
  const eidExpiration = useIOSelector(itwCredentialsEidExpirationSelector);
  const isEidExpired = eidStatus === "jwtExpired";
  const iconColor = useItwStatusIconColor(isEidExpired);

  useItwPendingReviewRequest();

  useDebugInfo({
    itw: {
      eidStatus,
      eidExpiration,
      cards
    }
  });

  const eidInfoBottomSheet = useIOBottomSheetModal({
    title: <ItwEidInfoBottomSheetTitle isExpired={isEidExpired} />,
    // Navigation does not seem to work when the bottom sheet's component is not inline
    component: <ItwEidInfoBottomSheetContent navigation={navigation} />
  });

  useFocusEffect(
    useCallback(
      // Automatically dismiss the bottom sheet when focus is lost
      () => eidInfoBottomSheet.dismiss,
      [eidInfoBottomSheet.dismiss]
    )
  );

  const handleNavigateToItwId = useCallback(() => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.PID_DETAIL
    });
  }, [navigation]);

  const sectionHeader = useMemo((): React.ReactElement => {
    if (isNewItwRenderable) {
      return (
        <>
          <ItwWalletIdStatus
            pidStatus={eidStatus}
            pidExpiration={eidExpiration}
            onPress={handleNavigateToItwId}
          />
          <VSpacer size={16} />
        </>
      );
    }
    return (
      <ListItemHeader
        testID={"walletCardsCategoryItwHeaderTestID"}
        iconName={"legalValue"}
        iconColor={iconColor}
        label={I18n.t("features.wallet.cards.categories.itw")}
        endElement={{
          type: "buttonLink",
          componentProps: {
            accessibilityLabel: I18n.t(
              "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
            ),
            label: I18n.t(
              "features.itWallet.presentation.bottomSheets.eidInfo.triggerLabel"
            ),
            onPress: eidInfoBottomSheet.present,
            testID: "walletCardsCategoryItwActiveBadgeTestID"
          }
        }}
      />
    );
  }, [
    iconColor,
    isNewItwRenderable,
    eidInfoBottomSheet.present,
    eidStatus,
    eidExpiration,
    handleNavigateToItwId
  ]);

  return (
    <>
      <WalletCardsCategoryContainer
        key={`cards_category_itw`}
        testID={`itwWalletCardsContainerTestID`}
        cards={cards}
        header={sectionHeader}
        topElement={
          <VStack space={16}>
            <ItwUpgradeBanner />
            <ItwWalletReadyBanner />
            {!shouldHideEidAlert && (
              <ItwEidLifecycleAlert
                lifecycleStatus={LIFECYCLE_STATUS}
                navigation={navigation}
              />
            )}
          </VStack>
        }
      />
      {eidInfoBottomSheet.bottomSheet}
    </>
  );
});
