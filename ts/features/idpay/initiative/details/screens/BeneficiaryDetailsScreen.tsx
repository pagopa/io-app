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
    O.map(dateString => `Ultimo aggiornamento: ${dateString}`),
    O.toUndefined
  );

  const tableItems: ReadonlyArray<TableItem> = [
    {
      label: "Riepilogo",
      value: [
        { label: "Stato iniziativa", value: statusString },
        { label: "Scadenza", value: endDateString },
        { label: "Saldo disponibile", value: amountString },
        { label: "In attesa di rimborso", value: toBeRefundedString },
        { label: "Total rimborsato", value: refundedString }
      ]
    },
    {
      label: "Regole di spesa",
      value: [
        { label: "A partire dal giorno", value: rankingStartDateString },
        { label: "Entro il giorno", value: rankingEndDateString },
        { label: "Percentuale riconosciuta", value: rewardPercentageString }
      ]
    },
    {
      label: "Regole di rimborso",
      value: [{ label: "Erogazione", value: "-" }]
    },
    {
      label: "Dettagli dell'adesione",
      value: [
        { label: "Data", value: "-" },
        { label: "Numero di protocollo", value: "-" }
      ]
    }
  ];

  return (
    <ScrollView>
      <ContentWrapper>
        <Table items={tableItems} />
        <LabelSmall weight="Regular" color="bluegrey">
          {lastUpdateString}
        </LabelSmall>
        <VSpacer size={16} />
        <View style={styles.linkRow}>
          <Link onPress={handlePrivacyLinkPress}>Preferenze & Privacy</Link>
        </View>
        <View style={styles.linkRow}>
          <Link onPress={handleUnsubscribePress} color="red">
            Rimuovi {details.initiativeName}
          </Link>
        </View>
        <VSpacer size={32} />
      </ContentWrapper>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  linkRow: {
    paddingVertical: 16
  }
});

export default BeneficiaryDetailsScreen;
