import { Content, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import I18n from "../i18n";
import themeVariables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { CheckBox } from "./core/selection/CheckBox";
import { H1 } from "./core/typography/H1";
import { BaseHeader } from "./screens/BaseHeader";
import Accordion from "./ui/Accordion";
import Markdown from "./ui/Markdown";
import IconFont from "./ui/IconFont";
import FooterWithButtons from "./ui/FooterWithButtons";

type ownProps = {
  onClose: () => void;
  onGoBack: () => void;
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: themeVariables.contentPadding
    // flex: 1
  }
});
const cancelButtonProps = (onContinue: () => void) => ({
  block: true,
  light: true,
  bordered: true,
  onPress: onContinue,
  title: I18n.t("global.buttons.cancel")
});
const CustomGoBackButton: React.FunctionComponent<{
  onPressHandler: () => void;
}> = ({ onPressHandler }) => (
  <ButtonDefaultOpacity
    accessibilityLabel={I18n.t("global.buttons.back")}
    transparent={true}
    onPress={onPressHandler}
  >
    <IconFont name={"io-back"} style={{ color: themeVariables.colorBlack }} />
  </ButtonDefaultOpacity>
);

const NewReporting: React.FunctionComponent<ownProps> = ({
  onClose,
  onGoBack
}) => (
  <>
    <BaseHeader
      accessibilityEvents={{
        avoidNavigationEventsUsage: true
      }}
      headerTitle={I18n.t("contextualHelp.title")}
      customRightIcon={{
        iconName: "io-close",
        onPress: onClose,
        accessibilityLabel: I18n.t("global.accessibility.contextualHelp.close")
      }}
      customGoBack={<CustomGoBackButton onPressHandler={onGoBack} />}
      showInstabugChat={false}
    />
    <Content contentContainerStyle={styles.contentContainer} noPadded={true}>
      <H1 accessible={true}>{"Nuova segnalazione"}</H1>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%"
        }}
      >
        <View>
          <View spacer={true} />
          <Markdown>
            {`Il Team di IO è a disposizione per risolvere eventuali **problemi** dell’app o per 
                    ascoltare i **suggerimenti** dei nostri utenti relativi a **migliorie o nuove funzionalità.**`}
          </Markdown>
          <View spacer={true} />
          <Markdown>
            {`Se hai dubbi sul **contenuto di un messaggio** o su un servizio, ti consigliamo di **contattare l'ente relativo**: 
                troverai i contatti in fondo al messaggio o nella scheda del servizio in questione.`}
          </Markdown>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "flex-end"
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-evenly"
            }}
          >
            <CheckBox />
            <View hspacer={true} />
            <View style={{ flex: 1 }}>
              <Markdown>
                {`Condividi il tuo codice fiscale, in modo da rendere più
                        semplice la risoluzione del problema.`}
              </Markdown>
              <Accordion
                title={"Come sapete il mio codice fiscale?"}
                content={`Il codice fiscale fa parte di quel set di dati che l’app IO riceve dall’identità SPID o dalla Carta d’identità 
                elettronica con cui hai effettuato l’accesso.
                Non è obbligatorio inviare il codice fiscale insieme alla segnalazione, ma permette all’assistenza di IO
                di fare analisi più mirate sui nostri sistemi e quindi di ridurre i tempi di risoluzione del problema.
                Per maggiori informazioni sul trattamento dei dati, consulta la nostra Informativa Privacy.`}
              ></Accordion>
            </View>
          </View>
        </View>
      </View>
    </Content>
    <FooterWithButtons
      type={"SingleButton"}
      leftButton={cancelButtonProps(onClose)}
    />
  </>
);

export default NewReporting;
