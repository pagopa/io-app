import { VSpacer } from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../definitions/idpay/InitiativeDetailDTO";
import { OnboardingStatusDTO } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import {
  RewardValueDTO,
  RewardValueTypeEnum
} from "../../../../../definitions/idpay/RewardValueDTO";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { format } from "../../../../utils/dates";
import { Table, TableRow } from "../../common/components/Table";
import { formatNumberCurrencyOrDefault } from "../../common/utils/strings";
import { IDPayUnsubscriptionRoutes } from "../../unsubscription/navigation/navigator";
import {
  InitiativeRulesInfoBox,
  InitiativeRulesInfoBoxSkeleton
} from "./InitiativeRulesInfoBox";

export type BeneficiaryDetailsProps =
  | {
      isLoading?: false;
      initiativeDetails: InitiativeDTO;
      beneficiaryDetails: InitiativeDetailDTO;
      onboardingStatus: OnboardingStatusDTO;
    }
  | {
      isLoading: true;
      initiativeDetails?: never;
      beneficiaryDetails?: never;
      onboardingStatus?: never;
    };

const formatDate = (fmt: string) => (date: Date) => format(date, fmt);

const BeneficiaryDetailsContent = (props: BeneficiaryDetailsProps) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const { initiativeDetails, beneficiaryDetails, onboardingStatus, isLoading } =
    props;

  if (isLoading) {
    return <BeneficiaryDetailsContentSkeleton />;
  }

  const {
    initiativeId,
    initiativeName,
    initiativeRewardType: initiativeType
  } = initiativeDetails;

  const ruleInfoBox = pipe(
    beneficiaryDetails.ruleDescription,
    O.fromNullable,
    O.fold(
      () => undefined,
      info => <InitiativeRulesInfoBox content={info} />
    )
  );

  const statusString = pipe(
    initiativeDetails.status,
    O.fromNullable,
    O.map(status =>
      I18n.t(`idpay.initiative.details.initiativeCard.statusLabels.${status}`)
    ),
    O.getOrElse(() => "-")
  );

  const endDateString = pipe(
    initiativeDetails.endDate,
    O.fromNullable,
    O.map(formatDate("DD/MM/YYYY")),
    O.getOrElse(() => "-")
  );

  const fruitionStartDateString = pipe(
    beneficiaryDetails.fruitionStartDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElse(() => "-")
  );

  const fruitionEndDateString = pipe(
    beneficiaryDetails.fruitionEndDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElse(() => "-")
  );

  const rewardRuleRow = pipe(
    beneficiaryDetails.rewardRule,
    O.fromNullable,
    O.map<RewardValueDTO, TableRow>(({ rewardValue, rewardValueType }) => {
      if (rewardValueType === RewardValueTypeEnum.ABSOLUTE) {
        return {
          label: I18n.t("idpay.initiative.beneficiaryDetails.spendValue"),
          value: formatNumberCurrencyOrDefault(rewardValue),
          testID: "spendValueTestID"
        };
      }
      return {
        label: I18n.t("idpay.initiative.beneficiaryDetails.spendPercentage"),
        value: `${rewardValue}%`,
        testID: "spendPercentageTestID"
      };
    }),
    O.getOrElse<TableRow>(() => ({ label: "-", value: "-" }))
  );

  const lastUpdateString = pipe(
    beneficiaryDetails.updateDate,
    O.fromNullable,
    O.map(formatDate("DD MMMM YYYY, HH:mm")),
    O.map(dateString =>
      I18n.t("idpay.initiative.beneficiaryDetails.lastUpdate", { dateString })
    ),
    O.toUndefined
  );

  const onboardingDateString = pipe(
    onboardingStatus.onboardingOkDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY, HH:mm")),
    O.getOrElse(() => "-")
  );

  const getTypeDependantTableRows = (): Array<TableRow> => {
    switch (initiativeDetails.initiativeRewardType) {
      case InitiativeRewardTypeEnum.DISCOUNT:
        return [
          {
            // in DISCOUNT initiatives, the spent amount is held in the accrued field,
            // while the refunded amount is always 0
            label: I18n.t("idpay.initiative.beneficiaryDetails.spentUntilNow"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.accrued),
            testID: "accruedTestID"
          }
        ];
      case InitiativeRewardTypeEnum.REFUND:
        return [
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.accrued),
            testID: "accruedTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.refunded"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.refunded),
            testID: "refundedTestID"
          }
        ];
      default:
        return [];
    }
  };

  const handlePrivacyLinkPress = () =>
    pipe(
      NonEmptyString.decode(beneficiaryDetails.serviceId),
      O.fromEither,
      O.map(serviceId =>
        navigation.navigate(ROUTES.SERVICES_NAVIGATOR, {
          screen: ROUTES.SERVICE_DETAIL,
          params: { serviceId }
        })
      )
    );

  const handleUnsubscribePress = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      initiativeId,
      initiativeName,
      initiativeType
    });

  return (
    <>
      {ruleInfoBox}
      <Table
        title={I18n.t("idpay.initiative.beneficiaryDetails.summary")}
        rows={[
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.status"),
            value: statusString,
            testID: "statusTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.endDate"),
            value: endDateString,
            testID: "endDateTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.amount"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.amount),
            testID: "amountTestID"
          },
          ...getTypeDependantTableRows()
        ]}
      />
      <VSpacer size={8} />
      <LabelSmall weight="Regular" color="bluegrey">
        {lastUpdateString}
      </LabelSmall>
      <VSpacer size={8} />
      <Table
        title={I18n.t("idpay.initiative.beneficiaryDetails.spendingRules")}
        rows={[
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.spendFrom"),
            value: fruitionStartDateString,
            testID: "fruitionStartDateTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.spendTo"),
            value: fruitionEndDateString,
            testID: "fruitionEndDateTestID"
          },
          rewardRuleRow
        ]}
      />
      <VSpacer size={8} />
      <Table
        title={I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDetails")}
        rows={[
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDate"),
            value: onboardingDateString,
            testID: "onboardingDateTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.protocolNumber"),
            value: "-",
            testID: "protocolTestID"
          }
        ]}
      />
      <VSpacer size={24} />
      <View style={styles.linkRow}>
        <Link onPress={handlePrivacyLinkPress}>
          {I18n.t("idpay.initiative.beneficiaryDetails.buttons.privacy")}
        </Link>
      </View>
      <View style={styles.linkRow}>
        <Link onPress={handleUnsubscribePress} color="red">
          {I18n.t("idpay.initiative.beneficiaryDetails.buttons.unsubscribe", {
            initiativeName
          })}
        </Link>
      </View>
      <VSpacer size={48} />
    </>
  );
};

const BeneficiaryDetailsContentSkeleton = () => (
  <>
    <InitiativeRulesInfoBoxSkeleton />
    {Array.from({ length: 3 }).map((_, i) => (
      <View key={i}>
        <VSpacer size={32} />
        <Placeholder.Box animate="fade" height={24} width={"40%"} radius={4} />
        <VSpacer size={8} />
        {Array.from({ length: 5 }).map((_, j) => (
          <View key={j}>
            <View style={IOStyles.rowSpaceBetween}>
              <Placeholder.Box
                animate="fade"
                height={24}
                width={100}
                radius={4}
              />
              <Placeholder.Box
                animate="fade"
                height={24}
                width={150}
                radius={4}
              />
            </View>
            <VSpacer size={8} />
          </View>
        ))}
      </View>
    ))}
  </>
);

const styles = StyleSheet.create({
  linkRow: {
    paddingVertical: 16
  }
});

export { BeneficiaryDetailsContent };
