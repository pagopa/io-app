import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Placeholder from "rn-placeholder";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../../definitions/idpay/InitiativeDetailDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { Icon } from "../../../../../components/core/icons";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import ButtonSolid from "../../../../../components/ui/ButtonSolid";
import Markdown from "../../../../../components/ui/Markdown";
import I18n from "../../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { format } from "../../../../../utils/dates";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { Table } from "../../../common/components/Table";
import { IDPayUnsubscriptionRoutes } from "../../../unsubscription/navigation/navigator";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
  initiativeName?: string;
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

  const { initiativeId, initiativeName } = route.params;

  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(idPayBeneficiaryDetailsGet.request({ initiativeId }));
  });

  const beneficiaryDetailsPot = useIOSelector(idPayBeneficiaryDetailsSelector);
  const initiativeDetailsPot = useIOSelector(idpayInitiativeDetailsSelector);

  const content = pipe(
    sequenceS(O.Monad)({
      details: pipe(initiativeDetailsPot, pot.toOption),
      beneficiaryDetails: pipe(beneficiaryDetailsPot, pot.toOption)
    }),
    O.fold(
      () => <ScreenSkeleton />,
      props => <BeneficiaryDetailsContent {...props} />
    )
  );

  return (
    <BaseScreenComponent goBack={true} headerTitle={initiativeName}>
      {content}
    </BaseScreenComponent>
  );
};

type BeneficiaryDetailsContentProps = {
  details: InitiativeDTO;
  beneficiaryDetails: InitiativeDetailDTO;
};

const BeneficiaryDetailsContent = (props: BeneficiaryDetailsContentProps) => {
  const { details, beneficiaryDetails } = props;
  const { initiativeId, initiativeName } = details;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

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

  const amountString = pipe(
    details.amount,
    O.fromNullable,
    O.map(formatNumberCurrency),
    O.getOrElse(() => "-")
  );

  const toBeRefundedString = pipe(
    sequenceS(O.Monad)({
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

  const handlePrivacyLinkPress = () =>
    navigation.navigate(ROUTES.SERVICES_NAVIGATOR, {
      screen: ROUTES.SERVICE_DETAIL,
      params: { serviceId: "placeholder" as NonEmptyString } // TODO service id
    });

  const handleUnsubscribePress = () =>
    navigation.navigate(IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN, {
      initiativeId,
      initiativeName
    });

  return (
    <ScrollView scrollIndicatorInsets={{ right: 1 }}>
      <ContentWrapper>
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
              value: amountString
            },
            {
              label: I18n.t("idpay.initiative.beneficiaryDetails.toBeRefunded"),
              value: toBeRefundedString
            },
            {
              label: I18n.t("idpay.initiative.beneficiaryDetails.refunded"),
              value: refundedString
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
          title={I18n.t(
            "idpay.initiative.beneficiaryDetails.enrollmentDetails"
          )}
          rows={[
            {
              label: I18n.t(
                "idpay.initiative.beneficiaryDetails.enrollmentDate"
              ),
              value: "-"
            },
            {
              label: I18n.t(
                "idpay.initiative.beneficiaryDetails.protocolNumber"
              ),
              value: "-"
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
    <H3>{I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title")}</H3>,
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
      <VSpacer size={32} />
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
            {I18n.t("idpay.initiative.beneficiaryDetails.infobox.rulesButton")}
          </Link>
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const ScreenSkeleton = () => (
  <>
    <View style={styles.infoBox}>
      <Placeholder.Box animate="fade" height={24} width={"40%"} radius={4} />
      <VSpacer size={16} />
      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i}>
          <Placeholder.Box
            animate="fade"
            height={16}
            width={"100%"}
            radius={4}
          />
          <VSpacer size={4} />
        </View>
      ))}
    </View>
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
  },
  infoBox: {
    borderColor: IOColors.bluegreyLight,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20
  }
});

export default BeneficiaryDetailsScreen;
