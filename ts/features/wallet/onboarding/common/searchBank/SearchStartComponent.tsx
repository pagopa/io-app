import * as React from "react";
import { Body, H2, H6, Label, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import InternationalCircuitIconsBar from "../../../../../components/wallet/InternationalCircuitIconsBar";

type Props = {
  openTosModal: () => void;
  onSearch?: () => void;
  methodType: "bancomatPay" | "bancomat" | "cobadge";
  showCircuitLogo?: boolean;
  bankName?: string;
  openParticipatingBanksModal?: () => void;
};

const bancomatLocales = () => ({
  title: I18n.t("wallet.searchAbi.bancomat.title"),
  text1: I18n.t("wallet.searchAbi.bancomat.description.text1"),
  text2: I18n.t("wallet.searchAbi.bancomat.description.text2"),
  text3: I18n.t("wallet.searchAbi.bancomat.description.text3"),
  text4: I18n.t("wallet.searchAbi.bancomat.description.text4")
});
const bancomatPayLocales = () => ({
  title: I18n.t("wallet.searchAbi.bpay.title"),
  text1: I18n.t("wallet.searchAbi.bpay.description.text1"),
  text2: I18n.t("wallet.searchAbi.bpay.description.text2"),
  text3: I18n.t("wallet.searchAbi.bpay.description.text3"),
  text4: I18n.t("wallet.searchAbi.bpay.description.text4")
});
const cobadgeLocales = () => ({
  title: I18n.t("wallet.searchAbi.cobadge.title"),
  text1: I18n.t("wallet.searchAbi.cobadge.description.text1"),
  text2: "",
  text3: I18n.t("wallet.searchAbi.cobadge.description.text3"),
  text4: I18n.t("wallet.searchAbi.cobadge.description.text4")
});
const loadLocales = (methodType: "bancomatPay" | "bancomat" | "cobadge") => {
  switch (methodType) {
    case "bancomat":
      return bancomatLocales();
    case "bancomatPay":
      return bancomatPayLocales();
    case "cobadge":
      return cobadgeLocales();
  }
};

export const SearchStartComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const locales = loadLocales(props.methodType);

  return (
    <>
      <H2>{locales.title}</H2>
      {props.showCircuitLogo && (
        <>
          <VSpacer size={24} />
          <InternationalCircuitIconsBar />
        </>
      )}

      <VSpacer size={24} />
      <Body>
        <H6 color={"bluegreyDark"}>{locales.text1}</H6>

        {props.methodType === "cobadge" && props.bankName ? (
          <H6 color={"bluegreyDark"}>{props.bankName}</H6>
        ) : (
          <Label
            asLink
            onPress={
              props.methodType === "cobadge"
                ? () => props.openParticipatingBanksModal?.()
                : props.openTosModal
            }
          >
            {locales.text2}
          </Label>
        )}
      </Body>

      <VSpacer size={24} />
      <Body accessibilityRole="link">
        <H6 color={"bluegreyDark"}>{locales.text3}</H6>
        <Label
          asLink
          onPress={
            props.methodType === "cobadge"
              ? props.openTosModal
              : () => props.onSearch?.()
          }
        >
          {locales.text4}
        </Label>
      </Body>
    </>
  );
};
