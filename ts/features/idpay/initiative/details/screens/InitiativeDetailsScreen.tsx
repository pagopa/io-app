import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { Pictogram } from "../../../../../components/core/pictograms";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import ButtonSolid from "../../../../../components/ui/ButtonSolid";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { IDPayConfigurationRoutes } from "../../configuration/navigation/navigator";
import { BonusCounter } from "../components/InitiativeBonusCounter";
import InitiativeDetailsBaseScreenComponent from "../components/InitiativeDetailsBaseScreenComponent";
import { InitiativeSettingsComponent } from "../components/InitiativeSettingsComponent";
import {
  InitiativeTimelineComponent,
  InitiativeTimelineComponentSkeleton
} from "../components/InitiativeTimelineComponent";
import { MissingConfigurationAlert } from "../components/MissingConfigurationAlert";
import { IDPayDetailsParamsList, IDPayDetailsRoutes } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  initiativeNeedsConfigurationSelector
} from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";
import { IDPayPaymentRoutes } from "../../../payment/navigation/navigator";

export type InitiativeDetailsScreenParams = {
  initiativeId: string;
};

type InitiativeDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_MONITORING"
>;

const InitiativeDetailsScreen = () => {
  const route = useRoute<InitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const navigateToBeneficiaryDetails = () => {
    navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
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

  const navigateToConfiguration = () => {
    navigation.navigate(IDPayConfigurationRoutes.IDPAY_CONFIGURATION_MAIN, {
      screen: IDPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: { initiativeId }
    });
  };

  const navigateToPaymentAuthorization = () => {
    navigation.navigate(IDPayPaymentRoutes.IDPAY_PAYMENT_MAIN, {
      screen: IDPayPaymentRoutes.IDPAY_PAYMENT_CODE_SCAN
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      dispatch(idpayInitiativeGet.request({ initiativeId }));
      dispatch(
        idpayTimelinePageGet.request({ initiativeId, page: 0, pageSize: 5 })
      );
    }, [dispatch, initiativeId])
  );

  const initiativeNeedsConfiguration = useIOSelector(
    initiativeNeedsConfigurationSelector
  );

  const getInitiativeCounters = (
    initiative: InitiativeDTO
  ): ReadonlyArray<BonusCounter> | undefined => {
    const isRefundable = initiative.status === InitiativeStatusEnum.REFUNDABLE;

    const availableAmount = initiative.amount || 0;
    const accruedAmount = initiative.accrued || 0;

    const amountProgress = pipe(
      sequenceS(O.Monad)({
        amount: O.fromNullable(initiative.amount),
        accrued: O.fromNullable(initiative.accrued),
        refunded: O.fromNullable(initiative.refunded)
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
        () => undefined,
        (type): ReadonlyArray<BonusCounter> => {
          switch (type) {
            case InitiativeRewardTypeEnum.DISCOUNT:
              return [
                {
                  type: "AmountWithProgress",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.availableAmount"
                  ),
                  amount: availableAmount,
                  progress: amountProgress,
                  isDisabled: !isRefundable
                }
              ];
            case InitiativeRewardTypeEnum.REFUND:
              return [
                {
                  type: "AmountWithProgress",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.availableAmount"
                  ),
                  amount: availableAmount,
                  progress: amountProgress,
                  isDisabled: !isRefundable
                },
                {
                  type: "Amount",
                  label: I18n.t(
                    "idpay.initiative.details.initiativeCard.toRefund"
                  ),
                  amount: accruedAmount,
                  isDisabled: !isRefundable
                }
              ];
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
                  <VSpacer size={8} />
                  <InitiativeTimelineComponent
                    initiativeId={initiativeId}
                    size={5}
                  />
                  <VSpacer size={32} />
                </ContentWrapper>
              );

            case InitiativeRewardTypeEnum.REFUND:
              if (initiativeNeedsConfiguration) {
                return (
                  <View style={styles.newInitiativeMessageContainer}>
                    <Pictogram name="setup" size={72} />
                    <VSpacer size={16} />
                    <H3>
                      {I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.header"
                      )}
                    </H3>
                    <VSpacer size={8} />
                    <Body style={{ textAlign: "center" }}>
                      {I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.notConfigured.footer",
                        { initiative: initiative.initiativeName }
                      )}
                    </Body>
                    <VSpacer size={16} />
                    <ButtonSolid
                      accessibilityLabel={I18n.t(
                        "idpay.initiative.details.initiativeDetailsScreen.configured.startConfigurationCTA"
                      )}
                      fullWidth={true}
                      color="primary"
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
                  <MissingConfigurationAlert
                    initiativeId={initiativeId}
                    status={initiative.status}
                  />
                  <VSpacer size={8} />
                  <InitiativeTimelineComponent
                    initiativeId={initiativeId}
                    size={3}
                  />
                  <VSpacer size={24} />
                  <InitiativeSettingsComponent initiative={initiative} />
                  <VSpacer size={32} />
                </ContentWrapper>
              );
          }
        }
      )
    );

  const getInitiativeFooter = (initiative: InitiativeDTO) =>
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
                <ButtonSolid
                  label={I18n.t(
                    "idpay.initiative.discountDetails.authorizeButton"
                  )}
                  accessibilityLabel={I18n.t(
                    "idpay.initiative.discountDetails.authorizeButton"
                  )}
                  icon="qrCode"
                  onPress={navigateToPaymentAuthorization}
                  fullWidth={true}
                />
              );

            case InitiativeRewardTypeEnum.REFUND:
              return undefined;
          }
        }
      )
    );

  return pipe(
    initiativeDataPot,
    pot.toOption,
    O.fold(
      () => (
        <InitiativeDetailsBaseScreenComponent
          isLoading={true}
          onHeaderDetailsPress={navigateToBeneficiaryDetails}
          counters={defaultLoadingCounters}
        >
          <ContentWrapper>
            <VSpacer size={8} />
            <InitiativeTimelineComponentSkeleton size={5} />
            <VSpacer size={32} />
          </ContentWrapper>
        </InitiativeDetailsBaseScreenComponent>
      ),
      initiative => (
        <InitiativeDetailsBaseScreenComponent
          initiative={initiative}
          onHeaderDetailsPress={navigateToBeneficiaryDetails}
          counters={getInitiativeCounters(initiative)}
          footer={getInitiativeFooter(initiative)}
        >
          {getInitiativeDetailsContent(initiative)}
        </InitiativeDetailsBaseScreenComponent>
      )
    )
  );
};

const defaultLoadingCounters: ReadonlyArray<BonusCounter> = [
  {
    type: "AmountWithProgress",
    isLoading: true
  }
];

const styles = StyleSheet.create({
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    flex: 1,
    flexGrow: 1
  }
});

export { InitiativeDetailsScreen };
