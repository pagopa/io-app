import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../../definitions/idpay/InitiativeDetailDTO";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { format } from "../../../../../utils/dates";
import { Table } from "../../../common/components/Table";
import { formatNumberCurrencyOrDefault } from "../../../common/utils/strings";
import {
  InitiativeRulesInfoBox,
  InitiativeRulesInfoBoxSkeleton
} from "./InitiativeRulesInfoBox";

type Props = {
  initiativeDetails: InitiativeDTO;
  beneficiaryDetails: InitiativeDetailDTO;
};

const formatDate = (fmt: string) => (date: Date) => format(date, fmt);

const BeneficiaryDetailsContent = (props: Props) => {
  const { initiativeDetails, beneficiaryDetails } = props;

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
    beneficiaryDetails.endDate,
    O.fromNullable,
    O.map(formatDate("DD/MM/YYYY")),
    O.getOrElse(() => "-")
  );

  const rankingStartDateString = pipe(
    beneficiaryDetails.rankingStartDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElse(() => "-")
  );

  const rankingEndDateString = pipe(
    beneficiaryDetails.rankingEndDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElse(() => "-")
  );

  const rewardPercentageString = pipe(
    beneficiaryDetails.refundRule?.accumulatedAmount?.refundThreshold,
    O.fromNullable,
    O.map(percentage => `${percentage}%`),
    O.getOrElse(() => "-")
  );

  const lastUpdateString = pipe(
    beneficiaryDetails.updateDate,
    O.fromNullable,
    O.map(formatDate("DD MMMM YYYY, hh:mm")),
    O.map(dateString =>
      I18n.t("idpay.initiative.beneficiaryDetails.lastUpdate", { dateString })
    ),
    O.toUndefined
  );

  return (
    <>
      {ruleInfoBox}
      <Table
        title={I18n.t("idpay.initiative.beneficiaryDetails.summary")}
        rows={[
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.status"),
            value: statusString
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.endDate"),
            value: endDateString
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.amount"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.amount)
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.accrued)
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.refunded"),
            value: formatNumberCurrencyOrDefault(initiativeDetails.refunded)
          }
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
            value: rankingStartDateString
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.spendTo"),
            value: rankingEndDateString
          },
          {
            label: I18n.t(
              "idpay.initiative.beneficiaryDetails.spendPercentage"
            ),
            value: rewardPercentageString
          }
        ]}
      />
      <VSpacer size={8} />
      <Table
        title={I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDetails")}
        rows={[
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDate"),
            value: "-"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.protocolNumber"),
            value: "-"
          }
        ]}
      />
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

export { BeneficiaryDetailsContent, BeneficiaryDetailsContentSkeleton };
