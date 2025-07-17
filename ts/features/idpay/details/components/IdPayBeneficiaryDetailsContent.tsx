import {
  Divider,
  IOSkeleton,
  ListItemAction,
  ListItemHeader,
  ListItemInfo,
  ListItemTransaction,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useNavigation } from "@react-navigation/native";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ReactNode } from "react";
import { View } from "react-native";
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
import { useIdPaySupportModal } from "../../common/hooks/useIdPaySupportModal";
import { formatNumberCurrencyOrDefault } from "../../common/utils/strings";
import { IDPayDetailsRoutes } from "../navigation";
import {
  IdPayInitiativeRulesInfoBox,
  IdPayInitiativeRulesInfoBoxSkeleton
} from "./IdPayInitiativeRulesInfoBox";
import { IdPayinitiativeStatusItem } from "./IdPayInitiativeStatusItem";

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

const IdPayBeneficiaryDetailsContent = (props: BeneficiaryDetailsProps) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const { startIdPaySupport } = useIdPaySupportModal();
  const { initiativeDetails, beneficiaryDetails, onboardingStatus, isLoading } =
    props;

  if (isLoading) {
    return <BeneficiaryDetailsContentSkeleton />;
  }

  const { initiativeRewardType: initiativeType } = initiativeDetails;

  const ruleInfoBox = pipe(
    beneficiaryDetails.ruleDescription,
    O.fromNullable,
    O.fold(
      () => undefined,
      info => <IdPayInitiativeRulesInfoBox content={info} />
    )
  );

  const endDateString = pipe(
    initiativeDetails.endDate,
    O.fromNullable,
    O.map(formatDate("DD/MM/YYYY, HH:mm")),
    O.getOrElse(() => "-")
  );

  const fruitionStartDateString = pipe(
    beneficiaryDetails.fruitionStartDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElseW(() => undefined)
  );

  const fruitionEndDateString = pipe(
    beneficiaryDetails.fruitionEndDate,
    O.fromNullable,
    O.map(formatDate("DD MMM YYYY")),
    O.getOrElseW(() => undefined)
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
            value:
              initiativeDetails.accruedCents !== undefined
                ? formatNumberCurrencyOrDefault(initiativeDetails.accruedCents)
                : undefined,
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

  const handleRequestHelpPress = () => {
    startIdPaySupport(IDPayDetailsRoutes.IDPAY_DETAILS_BENEFICIARY);
  };

  const summaryData = [
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
    ...getTypeDependantTableRows().filter(row => row.value)
  ];

  const enrollmentData = [
    {
      label: I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDate"),
      value: onboardingDateString,
      testID: "onboardingDateTestID"
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

  const canShowRulesData = !!spendingRulesData.filter(rule => rule.value);

  const renderTableRow = (data: Array<TableRow>) =>
    data
      .filter(el => el.value)
      .map((row, i) => (
        <View key={row.testID}>
          <ListItemInfo
            key={row.testID}
            label={row.label}
            value={row.value}
            testID={row.testID}
          />
          {i !== data.length - 1 && <Divider />}
        </View>
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
            <IdPayinitiativeStatusItem status={initiativeDetails.status} />
            {renderTableRow(summaryData)}
            <VSpacer size={8} />
            {canShowRulesData && (
              <>
                <ListItemHeader
                  label={I18n.t(
                    "idpay.initiative.beneficiaryDetails.spendingRules"
                  )}
                />
                {renderTableRow(spendingRulesData)}
              </>
            )}
            <ListItemHeader
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.enrollmentDetails"
              )}
            />
            {renderTableRow(enrollmentData)}
            <VSpacer size={16} />
            <ListItemAction
              icon="security"
              variant="primary"
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.buttons.privacy"
              )}
              onPress={handlePrivacyLinkPress}
            />
          </>
        );
      default:
        return (
          <>
            <VSpacer size={32} />
            <ListItemAction
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.buttons.privacy"
              )}
              onPress={handlePrivacyLinkPress}
              variant="primary"
            />
            <Divider />
            <ListItemAction
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.buttons.requestHelp"
              )}
              onPress={handleRequestHelpPress}
              variant="danger"
            />
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
    <IdPayInitiativeRulesInfoBoxSkeleton />
    {Array.from({ length: 3 }).map((_, i) => (
      <View key={i}>
        <VSpacer size={32} />
        <IOSkeleton shape="rectangle" width={"40%"} height={24} radius={4} />
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

export { IdPayBeneficiaryDetailsContent };
