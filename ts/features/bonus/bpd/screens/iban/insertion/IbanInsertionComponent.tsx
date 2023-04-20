import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useState } from "react";
import { View, Platform, SafeAreaView, ScrollView } from "react-native";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { makeFontStyleObject } from "../../../../../../components/core/fonts";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { H4 } from "../../../../../../components/core/typography/H4";
import { H5 } from "../../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { LabelledItem } from "../../../../../../components/LabelledItem";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { maybeNotNullyString } from "../../../../../../utils/strings";
import { FooterTwoButtons } from "../../../../bonusVacanze/components/markdown/FooterTwoButtons";

type OwnProps = {
  onBack: () => void;
  onIbanConfirm: (iban: Iban) => void;
  onContinue: () => void;
  startIban?: string;
  cancelText: string;
};

type Props = OwnProps &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

// https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Italian Iban max length: 27 (sample: IT60X0542811101000000123456)
const IbanMaxLength = 34;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  title: I18n.t("bonus.bpd.iban.insertion.title"),
  body1: I18n.t("bonus.bpd.iban.insertion.body1"),
  body1Bold: I18n.t("bonus.bpd.iban.insertion.body1Bold"),
  body2: I18n.t("bonus.bpd.iban.insertion.body2"),
  ibanDescription: I18n.t("bonus.bpd.iban.iban")
});

const IBANInputStyle = makeFontStyleObject("Regular", false, "RobotoMono");

const upperCaseAndNoBlanks = (text: string) =>
  text.replace(/\s/g, "").toUpperCase();

export const IbanInsertionComponent: React.FunctionComponent<Props> = props => {
  const [iban, setIban] = useState<string | undefined>(props.startIban);
  const isValidIban = iban && E.isRight(Iban.decode(iban));
  const { headerTitle, title, body1, body1Bold, body2, ibanDescription } =
    loadLocales();
  return (
    <BaseScreenComponent
      goBack={props.onBack}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <VSpacer size={24} />
            <H1>{title}</H1>
            <VSpacer size={24} />
            <Body>
              {body1}
              <H4>{body1Bold}</H4>
            </Body>
            <VSpacer size={24} />
            <H5>{ibanDescription}</H5>
            <LabelledItem
              isValid={pipe(
                maybeNotNullyString(iban),
                O.fold(
                  () => undefined,
                  _ => E.isRight(Iban.decode(iban))
                )
              )}
              inputProps={{
                value: iban,
                autoCapitalize: "characters",
                maxLength: IbanMaxLength,
                onChangeText: text => {
                  // On Android we cannot modify the input text, or the text is duplicated
                  setIban(
                    text
                      ? Platform.select({
                          android: text,
                          default: upperCaseAndNoBlanks(text)
                        })
                      : undefined
                  );
                },
                style: IBANInputStyle
              }}
            />
            <VSpacer size={32} />
            <Body>{body2}</Body>
          </View>
        </ScrollView>
        <FooterTwoButtons
          rightDisabled={!isValidIban}
          onRight={() =>
            pipe(
              Iban.decode(upperCaseAndNoBlanks(iban as string)),
              E.map(props.onIbanConfirm)
            )
          }
          onCancel={props.onContinue}
          rightText={I18n.t("global.buttons.continue")}
          leftText={props.cancelText}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
