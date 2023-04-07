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
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useOnFirstRender } from "../../../../../utils/hooks/useOnFirstRender";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { IDPayDetailsParamsList } from "../navigation";
import {
  idPayBeneficiaryDetailsSelector,
  idpayInitiativeDetailsSelector
} from "../store";
import { idPayBeneficiaryDetailsGet } from "../store/actions";

export type BeneficiaryDetailsScreenParams = {
  initiativeId: string;
};

type BeneficiaryDetailsScreenRouteProps = RouteProp<
  IDPayDetailsParamsList,
  "IDPAY_DETAILS_BENEFICIARY"
>;

const formatNumberCurrency = (amount: number) =>
  `${formatNumberAmount(amount, false)} €`;

const formatDate = (date: Date) => formatDateAsLocal(date, true, true);

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
      <LoadingSpinnerOverlay isLoading={isLoading}>
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

  const endDateString = pipe(
    beneficiaryDetails.endDate,
    O.fromNullable,
    O.map(formatDate),
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
    O.map(formatDate),
    O.getOrElse(() => "-")
  );

  const rankingEndDateString = pipe(
    beneficiaryDetails.rankingEndDate,
    O.fromNullable,
    O.map(formatDate),
    O.getOrElse(() => "-")
  );

  const rewardPercentageString = pipe(
    beneficiaryDetails.refundRule?.accumulatedAmount?.refundThreshold,
    O.fromNullable,
    O.map(percentage => `${percentage}%`),
    O.getOrElse(() => "-")
  );

  return (
    <ScrollView>
      <ContentWrapper>
        <View style={styles.sectionHeader}>
          <H3>Riepilogo</H3>
        </View>
        <View style={styles.infoRow}>
          <Body>Stato iniziativa</Body>
          <Body weight="SemiBold">{details.status}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Scadenza</Body>
          <Body weight="SemiBold">{endDateString}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Saldo disponibile</Body>
          <Body weight="SemiBold">{amountString}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>In attesa di rimborso</Body>
          <Body weight="SemiBold">{toBeRefundedString}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Total rimborsato</Body>
          <Body weight="SemiBold">{refundedString}</Body>
        </View>
        <VSpacer size={16} />
        <View style={styles.sectionHeader}>
          <H3>Regole di spesa</H3>
        </View>
        <View style={styles.infoRow}>
          <Body>A partire dal giorno</Body>
          <Body weight="SemiBold">{rankingStartDateString}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Entro il giorno</Body>
          <Body weight="SemiBold">{rankingEndDateString}</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Percentuale riconosciuta</Body>
          <Body weight="SemiBold">{rewardPercentageString}</Body>
        </View>
        <VSpacer size={16} />
        <View style={styles.sectionHeader}>
          <H3>Regole di rimborso</H3>
        </View>
        <View style={styles.infoRow}>
          <Body>Erogazione</Body>
          <Body weight="SemiBold">-</Body>
        </View>
        <VSpacer size={16} />
        <View style={styles.sectionHeader}>
          <H3>{"Dettagli dell'adesione"}</H3>
        </View>
        <View style={styles.infoRow}>
          <Body>Data</Body>
          <Body weight="SemiBold">-</Body>
        </View>
        <View style={styles.infoRow}>
          <Body>Numero di protocollo</Body>
          <Body weight="SemiBold">-</Body>
        </View>
        <VSpacer size={16} />
        <LabelSmall weight="Regular" color="bluegrey">
          Ultimo aggiornamento:{" "}
          {beneficiaryDetails.updateDate?.toLocaleDateString()}
        </LabelSmall>
        <VSpacer size={16} />
        <View style={styles.linkRow}>
          <Link>Preferenze & Privacy</Link>
        </View>
        <View style={styles.linkRow}>
          <Link color="red">Rimuovi {details.initiativeName}</Link>
        </View>
        <VSpacer size={32} />
      </ContentWrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    paddingTop: 16,
    paddingBottom: 8
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8
  },
  linkRow: {
    paddingVertical: 16
  }
});

export default BeneficiaryDetailsScreen;
