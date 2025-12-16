import {
  Body,
  ContentWrapper,
  H6,
  IOButton,
  IOToast,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useCallback, useLayoutEffect } from "react";
import { Linking, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  VoucherStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { BonusCardScreenComponent } from "../../../../components/BonusCard";
import { BonusCardCounter } from "../../../../components/BonusCard/BonusCardCounter";
import { withAppRequiredUpdate } from "../../../../components/helpers/withAppRequiredUpdate";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useFIMSAuthenticationFlow } from "../../../fims/common/hooks";
import { IdPayCodeCieBanner } from "../../code/components/IdPayCodeCieBanner";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";
import { ConfigurationMode } from "../../configuration/types";
import {
  trackIDPayDetailAuthorizationStart,
  trackIDPayDetailBottomSheetLanding,
  trackIDPayDetailError,
  trackIDPayDetailInfoAction,
  trackIDPayDetailLanding,
  trackIDPayDetailRetailersClick
} from "../analytics";
import { IdPayInitiativeDiscountSettingsComponent } from "../components/IdPayInitiativeDiscountSettingsComponent";
import { IdPayInitiativeLastUpdateCounter } from "../components/IdPayInitiativeLastUpdateCounter";
import { IdPayInitiativeRefundSettingsComponent } from "../components/IdPayInitiativeRefundSettingsComponent";
import {
  IdPayInitiativeTimelineComponent,
  IdPayInitiativeTimelineComponentSkeleton
} from "../components/IdPayInitiativeTimelineComponent";
import { IdPayMissingConfigurationAlert } from "../components/IdPayMissingConfigurationAlert";
import { useIdPayDiscountDetailsBottomSheet } from "../hooks/useIdPayDiscountDetailsBottomSheet";
import { IDPayDetailsParamsList, IDPayDetailsRoutes } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  initiativeNeedsConfigurationSelector
} from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";
import { IdPayCardStatus } from "../utils";

export type IdPayInitiativeDetailsScreenParams = {
  initiativeId: string;
};

type IdPayInitiativeDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_MONITORING"
>;

const IdPayInitiativeDetailsScreenComponent = () => {
  const route = useRoute<IdPayInitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useIONavigation();
  const dispatch = useIODispatch();
  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const navigateToBeneficiaryDetails = () => {
    trackIDPayDetailInfoAction({
      initiativeId,
      initiativeName: pot.getOrElse(
        pot.map(initiativeDataPot, initiative => initiative.initiativeName),
        undefined
      )
    });
    navigation.push(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
      screen: IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY,
      params: {
        initiativeId,
        initiativeName: pot.getOrElse(
          pot.map(initiativeDataPot, initiative => initiative.initiativeName),
          undefined
        )
      }
    });
  };

  const startFIMSAuthenticationFlow = useFIMSAuthenticationFlow();
  const onAddExpense = () => {
    const addExpenseFimsUrl = pot.toUndefined(initiativeDataPot)?.webViewUrl;
    if (!addExpenseFimsUrl) {
      return;
    }
    startFIMSAuthenticationFlow(
      I18n.t("idpay.initiative.discountDetails.addExpenseButton"),
      "01JKB969XNTW23RZTV61XAE824" as ServiceId, // TODO change this as soon as the serviceId is available in the initiativeDataPot
      addExpenseFimsUrl
    );
  };

  const navigateToConfiguration = () => {
    navigation.push(IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR, {
      screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: { initiativeId, mode: ConfigurationMode.COMPLETE }
    });
  };
  const discountBottomSheet = useIdPayDiscountDetailsBottomSheet(initiativeId);

  useFocusEffect(
    useCallback(() => {
      dispatch(idpayInitiativeGet.request({ initiativeId }));
      dispatch(
        idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize: 5 })
      );
    }, [dispatch, initiativeId])
  );

  const initiativeNeedsConfiguration = useIOSelector(
    initiativeNeedsConfigurationSelector
  );

  useOnFirstRender(
    () =>
      trackIDPayDetailLanding({
        initiativeName,
        initiativeId,
        status: initiative.voucherStatus
      }),
    () => pot.isSome(initiativeDataPot)
  );

  useLayoutEffect(() => {
    if (pot.isError(initiativeDataPot)) {
      navigation.setOptions({
        headerShown: false
      });
    }
  }, [initiativeDataPot, navigation]);

  useOnFirstRender(
    () => {
      if (pot.isError(initiativeDataPot)) {
        trackIDPayDetailError({
          initiativeId,
          initiativeName,
          reason: getNetworkErrorMessage(initiativeDataPot.error)
        });
      }
    },
    () => pot.isError(initiativeDataPot)
  );

  if (pot.isError(initiativeDataPot)) {
    return (
      <OperationResultScreenContent
        pictogram="umbrella"
        title={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.error.title"
        )}
        subtitle={I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.error.subtitle"
        )}
        action={{
          label: I18n.t("global.buttons.back"),
          onPress: () => navigation.pop()
        }}
      />
    );
  }

  if (!pot.isSome(initiativeDataPot)) {
    return (
      <BonusCardScreenComponent isLoading={true}>
        <ContentWrapper>
          <VSpacer size={8} />
          <IdPayInitiativeLastUpdateCounter isLoading={true} />
          <VSpacer size={8} />
          <IdPayInitiativeTimelineComponentSkeleton size={5} />
          <VSpacer size={32} />
        </ContentWrapper>
      </BonusCardScreenComponent>
    );
  }

  const getInitiativeCounters = (
    initiative: InitiativeDTO
  ): ReadonlyArray<BonusCardCounter> => {
    const availableAmount = initiative.amountCents || 0;
    const accruedAmount = initiative.accruedCents || 0;

    const amountProgress = pipe(
      sequenceS(O.Monad)({
        amount: O.fromNullable(initiative.amountCents),
        accrued: O.fromNullable(initiative.accruedCents),
        refunded: O.fromNullable(initiative.refundedCents)
      }),
      O.map(({ amount, accrued, refunded }) => ({
        total: amount + accrued + refunded,
        amount
      })),
      O.filter(({ total }) => total !== 0),
      O.map(({ amount, total }) => (amount / total) * 100.0),
      O.getOrElse(() => 100.0)
    );

    return pipe(
      initiative.initiativeRewardType,
      O.fromNullable,
      O.alt(() => O.some(InitiativeRewardTypeEnum.REFUND)),
      O.fold(
        () => [],
        (type): ReadonlyArray<BonusCardCounter> => {
          switch (type) {
            case InitiativeRewardTypeEnum.DISCOUNT:
              return [
                {
                  type: "ValueWithProgress",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.availableAmount"
                  ),
                  value: formatNumberCentsToAmount(
                    availableAmount,
                    true,
                    "right"
                  ),
                  progress: amountProgress
                }
              ];
            case InitiativeRewardTypeEnum.EXPENSE:
              return [
                {
                  type: "Value",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.refundRequestedAmount"
                  ),
                  value: formatNumberCentsToAmount(accruedAmount, true, "right")
                }
              ];
            case InitiativeRewardTypeEnum.REFUND:
              return [
                {
                  type: "ValueWithProgress",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.availableAmount"
                  ),
                  value: formatNumberCentsToAmount(
                    availableAmount,
                    true,
                    "right"
                  ),
                  progress: amountProgress
                },
                {
                  type: "Value",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.toRefund"
                  ),
                  value: formatNumberCentsToAmount(accruedAmount, true, "right")
                }
              ];
            default:
              return [];
          }
        }
      )
    );
  };

  const getInitiativeDetailsContent = (initiative: InitiativeDTO) =>
    pipe(
      initiative.initiativeRewardType,
      O.fromNullable,
      O.alt(() => O.some(InitiativeRewardTypeEnum.REFUND)),
      O.fold(
        () => undefined,
        rewardType => {
          switch (rewardType) {
            case InitiativeRewardTypeEnum.DISCOUNT:
              return (
                <ContentWrapper>
                  <IdPayCodeCieBanner initiativeId={initiative.initiativeId} />
                  <Animated.View layout={LinearTransition.duration(200)}>
                    <IdPayInitiativeTimelineComponent
                      initiativeId={initiative.initiativeId}
                      size={5}
                    />
                    <IdPayInitiativeDiscountSettingsComponent
                      initiative={initiative}
                    />
                  </Animated.View>
                </ContentWrapper>
              );
            case InitiativeRewardTypeEnum.EXPENSE:
              return (
                <ContentWrapper>
                  <VSpacer size={8} />
                  <IdPayInitiativeTimelineComponent
                    initiativeId={initiativeId}
                    size={3}
                  />
                  <VSpacer size={24} />
                </ContentWrapper>
              );
            case InitiativeRewardTypeEnum.REFUND:
              if (initiativeNeedsConfiguration) {
                return (
                  <View
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 32,
                      flex: 1,
                      flexGrow: 1
                    }}
                  >
                    <Pictogram name="empty" size={72} />
                    <VSpacer size={16} />
                    <H6>
                      {I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
                      )}
                    </H6>
                    <VSpacer size={8} />
                    <Body style={{ textAlign: "center" }}>
                      {I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
                        { initiative: initiative.initiativeName }
                      )}
                    </Body>
                    <VSpacer size={16} />
                    <IOButton
                      fullWidth
                      variant="solid"
                      onPress={navigateToConfiguration}
                      label={I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.configured.startConfigurationCTA"
                      )}
                    />
                  </View>
                );
              }

              return (
                <ContentWrapper>
                  <IdPayMissingConfigurationAlert
                    initiativeId={initiativeId}
                    status={initiative.status}
                  />
                  <VSpacer size={8} />
                  <IdPayInitiativeTimelineComponent
                    initiativeId={initiativeId}
                    size={3}
                  />
                  <VSpacer size={24} />
                  <IdPayInitiativeRefundSettingsComponent
                    initiative={initiative}
                  />
                  <VSpacer size={32} />
                </ContentWrapper>
              );
            default:
              return undefined;
          }
        }
      )
    );

  const handleOnShowMerchants = () => {
    if (!initiative.webViewUrl) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    trackIDPayDetailRetailersClick({
      initiativeId,
      initiativeName: initiative.initiativeName
    });
    void Linking.openURL(initiative.webViewUrl);
  };

  const getInitiativeFooterProps = (
    rewardType?: InitiativeRewardTypeEnum
  ): IOScrollViewActions | undefined => {
    switch (rewardType) {
      case InitiativeRewardTypeEnum.DISCOUNT: {
        if (
          initiative.voucherStatus === VoucherStatusEnum.EXPIRED ||
          initiative.voucherStatus === VoucherStatusEnum.USED
        ) {
          return;
        }
        const useBonusButton = {
          label: I18n.t("idpay.initiative.discountDetails.authorizeButton"),
          onPress: () => {
            trackIDPayDetailAuthorizationStart({
              initiativeId,
              initiativeName: initiative.initiativeName
            });
            discountBottomSheet.present();
            trackIDPayDetailBottomSheetLanding({
              initiativeId,
              initiativeName
            });
          }
        };
        const showMerchantsButton = {
          label: I18n.t("idpay.initiative.discountDetails.secondaryCta"),
          onPress: handleOnShowMerchants
        };
        if (!initiative.webViewUrl) {
          return {
            type: "SingleButton",
            primary: useBonusButton
          };
        }
        return {
          type: "TwoButtons",
          primary: useBonusButton,
          secondary: showMerchantsButton
        };
      }
      case InitiativeRewardTypeEnum.EXPENSE:
        return {
          type: "SingleButton",
          primary: {
            label: I18n.t("idpay.initiative.discountDetails.addExpenseButton"),
            onPress: onAddExpense
          }
        };
      default:
      case InitiativeRewardTypeEnum.REFUND:
        return undefined;
    }
  };

  const initiative = initiativeDataPot.value;
  const {
    initiativeName,
    organizationName,
    lastCounterUpdate,
    initiativeRewardType,
    logoURL
  } = initiative;

  return (
    <BonusCardScreenComponent
      title={initiativeName ?? ""}
      headerAction={{
        icon: "info",
        onPress: navigateToBeneficiaryDetails,
        accessibilityLabel: "info"
      }}
      logoUris={[{ uri: logoURL }]}
      name={initiativeName || ""}
      organizationName={organizationName || ""}
      status={<IdPayCardStatus initiative={initiative} />}
      counters={getInitiativeCounters(initiative)}
      actions={getInitiativeFooterProps(initiativeRewardType)}
    >
      <IdPayInitiativeLastUpdateCounter lastUpdateDate={lastCounterUpdate} />
      {getInitiativeDetailsContent(initiative)}
      {discountBottomSheet.bottomSheet}
    </BonusCardScreenComponent>
  );
};

const IdPayInitiativeDetailsScreen = withAppRequiredUpdate(
  IdPayInitiativeDetailsScreenComponent,
  "idpay.initiative_details"
);

export { IdPayInitiativeDetailsScreen };
