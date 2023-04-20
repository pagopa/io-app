import { Button } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Label } from "../../../../../../../components/core/typography/Label";
import { Link } from "../../../../../../../components/core/typography/Link";
import { Monospace } from "../../../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { isStringNullyOrEmpty } from "../../../../../../../utils/strings";
import { isReady, RemoteValue } from "../../../../model/RemoteValue";

export type BaseIbanProps = {
  iban: string | undefined;
  technicalAccount: RemoteValue<string | undefined, Error>;
  onInsertIban: () => void;
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between" },
  insertIbanButton: { width: "100%" }
});

/**
 * Render a Infobox that warns the user that should insert the IBAN to receive
 * the cashback amount
 * @param props
 * @constructor
 */
const NoIbanComponent = (props: { onPress: () => void }) => (
  <>
    <InfoBox>
      <Body>{I18n.t("bonus.bpd.details.components.iban.noIbanBody")}</Body>
    </InfoBox>
    <VSpacer size={16} />
    <Button style={styles.insertIbanButton} onPress={props.onPress}>
      <Label color={"white"}>
        {I18n.t("bonus.bpd.details.components.iban.button")}
      </Label>
    </Button>
  </>
);

/**
 * Display the current IBAN
 * @constructor
 */
const IbanComponent = (props: { iban: string }) => (
  <Monospace>{props.iban}</Monospace>
);

/**
 * Display the technical IBAN message
 * @constructor
 */
const TechnicalIbanComponent = (props: { technicalIban: string }) => (
  <Body>{props.technicalIban}</Body>
);

export const BaseIbanInformationComponent: React.FunctionComponent<BaseIbanProps> =
  props => (
    <View style={IOStyles.flex}>
      <View style={styles.row}>
        <H4>{I18n.t("bonus.bpd.details.components.iban.title")}</H4>
        {!isStringNullyOrEmpty(props.iban) && (
          <Link onPress={props.onInsertIban}>
            {I18n.t("global.buttons.edit").toLowerCase()}
          </Link>
        )}
      </View>
      <VSpacer size={16} />
      {/* Also if it is a technical IBAN the field IBAN is filled (with a fake IBAN). */}
      {props.iban ? (
        isReady(props.technicalAccount) &&
        props.technicalAccount.value !== undefined ? (
          <TechnicalIbanComponent
            technicalIban={props.technicalAccount.value}
          />
        ) : (
          <IbanComponent iban={props.iban} />
        )
      ) : (
        <NoIbanComponent onPress={props.onInsertIban} />
      )}
      <VSpacer size={16} />
    </View>
  );
