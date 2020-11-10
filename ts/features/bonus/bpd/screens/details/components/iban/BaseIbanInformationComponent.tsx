import { Button, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { InfoBox } from "../../../../../../../components/box/InfoBox";
import { Body } from "../../../../../../../components/core/typography/Body";
import { H4 } from "../../../../../../../components/core/typography/H4";
import { Label } from "../../../../../../../components/core/typography/Label";
import { Link } from "../../../../../../../components/core/typography/Link";
import { Monospace } from "../../../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../../../i18n";
import { isStringNullyOrEmpty } from "../../../../../../../utils/strings";

export type BaseIbanProps = {
  iban: string | undefined;
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
    <View spacer={true} />
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

export const BaseIbanInformationComponent: React.FunctionComponent<BaseIbanProps> = props => (
  <View style={IOStyles.flex}>
    <View style={styles.row}>
      <H4>{I18n.t("bonus.bpd.details.components.iban.title")}</H4>
      {!isStringNullyOrEmpty(props.iban) && (
        <Link onPress={props.onInsertIban}>
          {I18n.t("global.buttons.edit").toLowerCase()}
        </Link>
      )}
    </View>
    <View spacer={true} />
    {props.iban ? (
      <IbanComponent iban={props.iban} />
    ) : (
      <NoIbanComponent onPress={props.onInsertIban} />
    )}
    <View spacer={true} />
  </View>
);
