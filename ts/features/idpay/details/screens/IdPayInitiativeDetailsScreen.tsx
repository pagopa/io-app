import {
  Body,
  ButtonSolid,
  ContentWrapper,
  H6,
  LabelMini,
  Pictogram,
  Tag,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation, useRoute } from "@react-navigation/core";
import { RouteProp, useFocusEffect } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { BonusCardScreenComponent } from "../../../../components/BonusCard";
import { BonusCardCounter } from "../../../../components/BonusCard/BonusCardCounter";
import { BonusStatus } from "../../../../components/BonusCard/type";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { format } from "../../../../utils/dates";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { IdPayCodeCieBanner } from "../../code/components/IdPayCodeCieBanner";
import { IdPayConfigurationRoutes } from "../../configuration/navigation/routes";
import { ConfigurationMode } from "../../configuration/types";
import { IdPayInitiativeLastUpdateCounter } from "../components/IdPayInitiativeLastUpdateCounter";
import { InitiativeDiscountSettingsComponent } from "../components/InitiativeDiscountSettingsComponent";
import { InitiativeRefundSettingsComponent } from "../components/InitiativeRefundSettingsComponent";
import {
  InitiativeTimelineComponent,
  InitiativeTimelineComponentSkeleton
} from "../components/InitiativeTimelineComponent";
import { MissingConfigurationAlert } from "../components/MissingConfigurationAlert";
import { useIdPayDiscountDetailsBottomSheet } from "../hooks/useIdPayDiscountDetailsBottomSheet";
import { IDPayDetailsParamsList, IDPayDetailsRoutes } from "../navigation";
import {
  idpayInitiativeDetailsSelector,
  initiativeNeedsConfigurationSelector
} from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";

export type IdPayInitiativeDetailsScreenParams = {
  initiativeId: string;
};

type IdPayInitiativeDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_MONITORING"
>;

const IdPayInitiativeDetailsScreen = () => {
  const route = useRoute<IdPayInitiativeDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();
  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);

  const navigateToBeneficiaryDetails = () => {
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

  const navigateToConfiguration = () => {
    navigation.push(IdPayConfigurationRoutes.IDPAY_CONFIGURATION_NAVIGATOR, {
      screen: IdPayConfigurationRoutes.IDPAY_CONFIGURATION_INTRO,
      params: { initiativeId, mode: ConfigurationMode.COMPLETE }
    });
  };
  const discountBottomSheet = useIdPayDiscountDetailsBottomSheet(initiativeId);

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

  if (!pot.isSome(initiativeDataPot)) {
    return (
      <BonusCardScreenComponent isLoading={true}>
        <ContentWrapper>
          <VSpacer size={8} />
          <IdPayInitiativeLastUpdateCounter isLoading={true} />
          <VSpacer size={8} />
          <InitiativeTimelineComponentSkeleton size={5} />
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
                    <InitiativeTimelineComponent
                      initiativeId={initiative.initiativeId}
                      size={5}
                    />
                    <InitiativeDiscountSettingsComponent
                      initiative={initiative}
                    />
                  </Animated.View>
                </ContentWrapper>
              );

            case InitiativeRewardTypeEnum.REFUND:
              if (initiativeNeedsConfiguration) {
                return (
                  <View style={styles.newInitiativeMessageContainer}>
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
                  <InitiativeRefundSettingsComponent initiative={initiative} />
                  <VSpacer size={32} />
                </ContentWrapper>
              );
          }
        }
      )
    );

  const getInitiativeFooterProps = (
    rewardType?: InitiativeRewardTypeEnum
  ): IOScrollViewActions | undefined => {
    switch (rewardType) {
      case InitiativeRewardTypeEnum.DISCOUNT:
        return {
          type: "SingleButton",
          primary: {
            label: I18n.t("idpay.initiative.discountDetails.authorizeButton"),
            onPress: discountBottomSheet.present
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
      status={<IdPayCardStatus now={new Date()} initiative={initiative} />}
      counters={getInitiativeCounters(initiative)}
      actions={getInitiativeFooterProps(initiativeRewardType)}
    >
      <IdPayInitiativeLastUpdateCounter lastUpdateDate={lastCounterUpdate} />
      {getInitiativeDetailsContent(initiative)}
      {discountBottomSheet.bottomSheet}
    </BonusCardScreenComponent>
  );
};

const styles = StyleSheet.create({
  newInitiativeMessageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    flex: 1,
    flexGrow: 1
  }
});

export { IdPayInitiativeDetailsScreen };

export function IdPayCardStatus({
  now,
  initiative
}: {
  now: Date;
  initiative: InitiativeDTO;
}) {
  const getInitiativeStatus = (): BonusStatus => {
    if (initiative.status === StatusEnum.UNSUBSCRIBED) {
      return "REMOVED";
    }

    if (now > initiative.endDate) {
      return "EXPIRED";
    }

    const next7Days = new Date(new Date(now).setDate(now.getDate() + 7));
    if (next7Days > initiative.endDate) {
      return "EXPIRING";
    }

    return "ACTIVE";
  };

  switch (getInitiativeStatus()) {
    case "ACTIVE":
      return (
        <LabelMini weight="Regular" color="grey-650">
          {I18n.t("bonusCard.validUntil", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        </LabelMini>
      );
    case "EXPIRING":
      return (
        <Tag
          variant="warning"
          text={I18n.t("bonusCard.expiring", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        />
      );
    case "EXPIRED":
      return (
        <Tag
          variant="error"
          text={I18n.t("bonusCard.expired", {
            endDate: format(initiative.endDate, "DD/MM/YY")
          })}
        />
      );
    case "PAUSED":
      return <Tag variant="info" text={I18n.t("bonusCard.paused")} />;
    case "REMOVED":
      return <Tag variant="error" text={I18n.t("bonusCard.removed")} />;
  }
}
