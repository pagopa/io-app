import { View } from "native-base";
import * as React from "react";
import { fromNullable } from "fp-ts/lib/Option";
import I18n from "../../../../../i18n";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { H4 } from "../../../../../components/core/typography/H4";
import { Link } from "../../../../../components/core/typography/Link";

type Props = {
  openTosModal: () => void;
  onSearch: () => void;
  methodType: "bancomatpay" | "pagobancomat";
};

type LocalesText = {
  title: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
};

const bancomatLocales = {
  title: I18n.t("wallet.searchAbi.bancomat.title"),
  text1: I18n.t("wallet.searchAbi.bancomat.description.text1"),
  text2: I18n.t("wallet.searchAbi.bancomat.description.text2"),
  text3: I18n.t("wallet.searchAbi.bancomat.description.text3"),
  text4: I18n.t("wallet.searchAbi.bancomat.description.text4")
};

const mapLoacalesFromMethod = new Map<string, LocalesText>([
  [
    "bancomatpay",
    {
      title: I18n.t("wallet.searchAbi.bpay.title"),
      text1: I18n.t("wallet.searchAbi.bpay.description.text1"),
      text2: I18n.t("wallet.searchAbi.bpay.description.text2"),
      text3: I18n.t("wallet.searchAbi.bpay.description.text3"),
      text4: I18n.t("wallet.searchAbi.bpay.description.text4")
    }
  ],
  ["bancomat", bancomatLocales]
]);

export const SearchStartComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const locales = fromNullable(
    mapLocalesFromMethod.get(props.methodType)
  ).getOrElse(bancomatLocales);

  return (
    <>
      <H1>{locales.title}</H1>
      <View spacer={true} large={true} />
      <Body>
        <H4 weight={"Regular"} color={"bluegreyDark"}>
          {locales.text1}
        </H4>
        <Link onPress={props.openTosModal}>{locales.text2}</Link>
      </Body>
      <View spacer={true} large={true} />
      <Body>
        <H4 weight={"Regular"} color={"bluegreyDark"}>
          {locales.text3}
        </H4>
        <Link onPress={props.onSearch}>{locales.text4}</Link>
      </Body>
    </>
  );
};
