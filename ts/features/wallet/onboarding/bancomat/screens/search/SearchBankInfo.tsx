import { View } from "native-base";
import * as React from "react";
import I18n from "../../../../../../i18n";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { H4 } from "../../../../../../components/core/typography/H4";
import { Link } from "../../../../../../components/core/typography/Link";

type Props = {
  openTosModal: () => void;
  onSearch: () => void;
};

export const SearchBankInfo: React.FunctionComponent<Props> = (
  props: Props
) => (
  <>
    <H1>Ricerca delle tue carte PagoBANCOMAT</H1>
    <View spacer={true} large={true} />
    <Body>
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        {I18n.t("wallet.searchAbi.description.text1")}
      </H4>
      <Link onPress={props.openTosModal}>
        {I18n.t("wallet.searchAbi.description.text2")}
      </Link>
    </Body>
    <View spacer={true} large={true} />
    <Body>
      <H4 weight={"Regular"} color={"bluegreyDark"}>
        {I18n.t("wallet.searchAbi.description.text3")}
      </H4>
      <Link onPress={props.onSearch}>
        {I18n.t("wallet.searchAbi.description.text4")}
      </Link>
    </Body>
  </>
);
