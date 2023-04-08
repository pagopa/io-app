import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../../definitions/idpay/InitiativeDetailDTO";
import LoadingSpinnerOverlay from "../../../../../components/LoadingSpinnerOverlay";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { format } from "../../../../../utils/dates";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { Table, TableItem } from "../../../common/components/Table";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import { idPayBeneficiaryDetailsGet } from "../store/actions";
import { openWebUrl } from "../../../../../utils/url";
import I18n from "../../../../../i18n";
import { H4 } from "../../../../../components/core/typography/H4";
import { Body } from "../../../../../components/core/typography/Body";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { Icon } from "../../../../../components/core/icons";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import ButtonSolid from "../../../../../components/ui/ButtonSolid";
import Markdown from "../../../../../components/ui/Markdown";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
};

type BeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const formatNumberCurrency = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const formatDate = (fmt: string) => (date: Date) => format(date, fmt);

const BeneficiaryDetailsScreen = () => {
  const route = useRoute<BeneficiaryDetailsScreenRouteProps>();

  const { initiativeId } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
  });

  const beneficiaryDetailsPot = useIOSelector(idPayBeneficiaryDetailsSelector);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);

  const isLoading = pot.isLoading(beneficiaryDetailsPot);

  const initiativeName = pipe(
    initiativeDetailsPot,
    pot.toOption,
    O.map(initiative => initiative.initiativeName),
    O.toUndefined
  );

  const content = pipe(
    sequenceS(O.option)({
      details: pipe(initiativeDetailsPot, pot.toOption),
      beneficiaryDetails: pipe(beneficiaryDetailsPot, pot.toOption)
    }),
    O.fold(
      () => undefined,
      props => <BeneficiaryDetailsComponent {...props} />
    )
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={initiativeName}>
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={100}>
        {content}
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

type BeneficiaryDetailsComponentProps = {
  details: InitiativeDTO;
  beneficiaryDetails: InitiativeDetailDTO;
};

const BeneficiaryDetailsComponent = (
  props: BeneficiaryDetailsComponentProps
) => {
  const { details, beneficiaryDetails } = props;

  const handlePrivacyLinkPress = () =>
    pipe(
      beneficiaryDetails.privacyLink,
      O.fromNullable,
      O.map(openWebUrl),
      O.toUndefined
    );

  const handleUnsubscribePress = () => {
    // TODO add unsubscription flow
  };

  const ruleInfoBox = pipe(
    beneficiaryDetails.ruleDescription,
    O.fromNullable,
    O.fold(
      () => undefined,
      info => <RulesInfoBox info={info} />
    )
  );

  const statusString = pipe(
    details.status,
    O.fromNullable,
    O.map(status => status.toLocaleLowerCase()),
    O.getOrElse(() => "-")
  );

  const endDateString = pipe(
    beneficiaryDetails.endDate,
    O.fromNullable,
    O.map(formatDate("DD/MM/YYYY")),
    O.getOrElse(() => "-")
  );

  const amountString = pipe(
    details.amount,
    O.fromNullable,
    O.map(formatNumberCurrency),
    O.getOrElse(() => "-")
  );

  const toBeRefundedString = pipe(
    sequenceS(O.option)({
      accrued: pipe(details.accrued, O.fromNullable),
      refunded: pipe(details.refunded, O.fromNullable)
    }),
    O.map(({ accrued, refunded }) => accrued - refunded),
    O.map(formatNumberCurrency),
    O.getOrElse(() => "-")
  );

  const refundedString = pipe(
    details.refunded,
    O.fromNullable,
    O.map(formatNumberCurrency),
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

  const tableItems: ReadonlyArray<TableItem> = [
    {
      label: I18n.t("idpay.initiative.beneficiaryDetails.summary"),
      value: [
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
          value: amountString
        },
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded"),
          value: toBeRefundedString
        },
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.refundRules"),
          value: refundedString
        }
      ]
    },
    {
      label: I18n.t("idpay.initiative.beneficiaryDetails.spendFrom"),
      value: [
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.spendFrom"),
          value: rankingStartDateString
        },
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.spendTo"),
          value: rankingEndDateString
        },
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.spendPercentage"),
          value: rewardPercentageString
        }
      ]
    },
    {
      label: I18n.t("idpay.initiative.beneficiaryDetails.refundRules"),
      value: [
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.refundType"),
          value: "-"
        }
      ]
    },
    {
      label: I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDetails"),
      value: [
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.enrollmentDate"),
          value: "-"
        },
        {
          label: I18n.t("idpay.initiative.beneficiaryDetails.protocolNumber"),
          value: "-"
        }
      ]
    }
  ];

  return (
    <ScrollView>
      <ContentWrapper>
        {ruleInfoBox}
        <Table items={tableItems} />
        <LabelSmall weight="Regular" color="bluegrey">
          {lastUpdateString}
        </LabelSmall>
        <VSpacer size={16} />
        <View style={styles.linkRow}>
          <Link onPress={handlePrivacyLinkPress}>
            {I18n.t("idpay.initiative.beneficiaryDetails.buttons.privacy")}
          </Link>
        </View>
        <View style={styles.linkRow}>
          <Link onPress={handleUnsubscribePress} color="red">
            {I18n.t("idpay.initiative.beneficiaryDetails.buttons.unsubscribe", {
              initiativeName: details.initiativeName
            })}
          </Link>
        </View>
        <VSpacer size={32} />
      </ContentWrapper>
    </ScrollView>
  );
};

type RulesInfoBoxProps = {
  info: string;
};

const RulesInfoBox = (props: RulesInfoBoxProps) => {
  const { info } = props;

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal(
    <Markdown>{info}</Markdown>,
    I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title"),
    700,
    <ContentWrapper>
      <VSpacer size={16} />
      <ButtonSolid
        label={I18n.t("idpay.initiative.beneficiaryDetails.infoModal.button")}
        onPress={() => dismiss()}
        accessibilityLabel={I18n.t(
          "idpay.initiative.beneficiaryDetails.infoModal.button"
        )}
        fullWidth={true}
      />
      <VSpacer size={16} />
    </ContentWrapper>
  );

  return (
    <>
      <View style={styles.infoBox}>
        <H4>{I18n.t("idpay.initiative.beneficiaryDetails.infobox.title")}</H4>
        <VSpacer size={4} />
        <Body numberOfLines={3} ellipsizeMode="tail">
          {info}
        </Body>
        <VSpacer size={16} />
        <View style={IOStyles.row}>
          <Icon name="categLearning" color="blue" />
          <HSpacer size={8} />
          <Link onPress={() => present()}>
            {I18n.t("idpay.initiative.beneficiaryDetails.infobox.rulesButton")}{" "}
          </Link>
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const styles = StyleSheet.create({
  linkRow: {
    paddingVertical: 16
  },
  infoBox: {
    borderColor: IOColors.bluegreyLight,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16
  }
});

export default BeneficiaryDetailsScreen;
