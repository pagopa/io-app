import * as React from "react";
import { Alert, View } from "react-native";
import { IOThemeContext } from "@pagopa/io-app-design-system";
import { H2 } from "../../../components/core/typography/H2";
import { DSComponentViewerBox } from "../components/DSComponentViewerBox";
import { DesignSystemScreen } from "../components/DesignSystemScreen";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { ModulePaymentNotice } from "../../../components/ui/ModulePaymentNotice";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

export const DSModules = () => (
  <IOThemeContext.Consumer>
    {theme => (
      <DesignSystemScreen title="Modules">
        <H2
          color={theme["textHeading-default"]}
          weight={"SemiBold"}
          style={{ marginBottom: 16, marginTop: 16 }}
        >
          ModulePaymentNotice
        </H2>
        {renderModulePaymentNotice()}
      </DesignSystemScreen>
    )}
  </IOThemeContext.Consumer>
);

const renderModulePaymentNotice = () => (
  <>
    <DSComponentViewerBox name="ModulePaymentNotice">
      <View>
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="default"
          paymentNoticeAmount="1.000,00 €"
          isLoading={true}
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="default"
          paymentNoticeAmount="1.000,00 €"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="payed"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="error"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="expired"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="revoked"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          title="Codice avviso"
          subtitle="9999 9999 9999 9999 99"
          paymentNoticeStatus="canceled"
          onPress={onButtonPress}
        />
        <VSpacer size={16} />
        <ModulePaymentNotice
          subtitle="TARI 2023 - Rata 01"
          paymentNoticeStatus="default"
          paymentNoticeAmount="1.000,00 €"
          onPress={onButtonPress}
        />
      </View>
    </DSComponentViewerBox>
  </>
);
