import {
  Body,
  BodySmall,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemTransaction,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ReactNode } from "react";
import { View } from "react-native";
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
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { format } from "../../../../utils/dates";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { formatNumberCurrencyOrDefault } from "../../common/utils/strings";
import { IdPayUnsubscriptionRoutes } from "../../unsubscription/navigation/routes";
import {
  InitiativeRulesInfoBox,
  InitiativeRulesInfoBoxSkeleton
} from "./InitiativeRulesInfoBox";

type TableRow = WithTestID<{
  label: string;
  value: string | ReactNode;
}>;

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
            value: formatNumberCurrencyOrDefault(
              initiativeDetails.accruedCents
            ),
            testID: "accruedTestID"
          }
        ];
      case InitiativeRewardTypeEnum.REFUND:
        return [
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded"),
            value: formatNumberCurrencyOrDefault(
              initiativeDetails.accruedCents
            ),
            testID: "accruedTestID"
          },
          {
            label: I18n.t("idpay.initiative.beneficiaryDetails.refunded"),
            value: formatNumberCurrencyOrDefault(
              initiativeDetails.refundedCents
            ),
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
        navigation.navigate(SERVICES_ROUTES.SERVICES_NAVIGATOR, {
          screen: SERVICES_ROUTES.SERVICE_DETAIL,
          params: { serviceId }
        })
      )
    );

  const handleUnsubscribePress = () => {
    pipe(
      sequenceS(O.Monad)({
        initiativeName: O.fromNullable(initiativeName),
        initiativeType: O.fromNullable(initiativeType)
      }),
      O.map(({ initiativeName, initiativeType }) => {
        navigation.navigate(
          IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN,
          {
            screen: IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION,
            params: {
              initiativeId,
              initiativeName,
              initiativeType
            }
          }
        );
      })
    );
  };

  const summaryData = [
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
      value: formatNumberCurrencyOrDefault(initiativeDetails.amountCents),
      testID: "amountTestID"
    },
    ...getTypeDependantTableRows()
  ];

  const enrollmentData = [
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
  ];

  const spendingRulesData = [
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
  ];

  const renderTableRow = (data: Array<TableRow>) =>
    data.map((row, i) => (
      <>
        <ListItemInfo
          key={row.testID}
          label={row.label}
          value={row.value}
          testID={row.testID}
        />
        {i !== data.length - 1 && <Divider />}
      </>
    ));

  const renderBeneficiaryDetailsContent = () => {
    switch (initiativeType) {
      case InitiativeRewardTypeEnum.DISCOUNT:
      case InitiativeRewardTypeEnum.REFUND:
        return (
          <>
            <ListItemHeader
              label={I18n.t("idpay.initiative.beneficiaryDetails.summary")}
            />
            {renderTableRow(summaryData)}
            <VSpacer size={8} />
            <BodySmall weight="Regular">{lastUpdateString}</BodySmall>
            <VSpacer size={8} />
            <ListItemHeader
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.spendingRules"
              )}
            />
            {renderTableRow(spendingRulesData)}
            <ListItemHeader
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.enrollmentDetails"
              )}
            />
            {renderTableRow(enrollmentData)}
            <VSpacer size={16} />
            <Body weight="Semibold" asLink onPress={handlePrivacyLinkPress}>
              {I18n.t("idpay.initiative.beneficiaryDetails.buttons.privacy")}
            </Body>
            <VSpacer size={16} />
            <Body weight="Semibold" asLink onPress={handleUnsubscribePress}>
              {I18n.t(
                "idpay.initiative.beneficiaryDetails.buttons.unsubscribe",
                {
                  initiativeName
                }
              )}
            </Body>
          </>
        );
      default:
        return (
          <>
            <VSpacer size={32} />
            <Body weight="Semibold" asLink onPress={handlePrivacyLinkPress}>
              {I18n.t("idpay.initiative.beneficiaryDetails.buttons.privacy")}
            </Body>
          </>
        );
    }
  };

  return (
    <>
      {ruleInfoBox}
      {renderBeneficiaryDetailsContent()}
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
        {Array.from({ length: 2 }).map((_, j) => (
          <View key={j}>
            <ListItemTransaction
              isLoading
              subtitle=""
              title=""
              transaction={{
                amountAccessibilityLabel: "",
                amount: "0"
              }}
            />
            <VSpacer size={8} />
          </View>
        ))}
      </View>
    ))}
  </>
);

export { BeneficiaryDetailsContent };
