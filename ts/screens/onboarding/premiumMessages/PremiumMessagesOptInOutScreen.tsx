import React from "react";
import { SafeAreaView, Text } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import paymentCompleted from "../../../../img/pictograms/payment-completed.png";
import I18n from "../../../i18n";

type Props = void;

export const PremiumMessagesOptInOutScreen = (_: Props) => (
  <SafeAreaView style={IOStyles.flex}>
    <InfoScreenComponent
      image={renderInfoRasterImage(paymentCompleted)}
      title={I18n.t("services.optIn.preferences.completed.title")}
      body={I18n.t("services.optIn.preferences.completed.body")}
    />

    <Text>Premium Messages Opt-in/out</Text>
  </SafeAreaView>
);
