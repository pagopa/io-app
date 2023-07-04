import React from "react";
import { View } from "react-native";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { VSpacer } from "../../../components/core/spacer/Spacer";
import { Divider } from "../../../components/core/Divider";
import Markdown from "../../../components/ui/Markdown";
import I18n from "../../../i18n";

const ItwTos = () => (
  <View style={IOStyles.horizontalContentPadding}>
    <VSpacer />
    <Divider />
    <VSpacer />
    <Markdown avoidTextSelection={true} extraBodyHeight={40}>
      {I18n.t("features.itWallet.activationScreen.tos")}
    </Markdown>
  </View>
);

export default ItwTos;
