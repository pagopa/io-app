/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import I18n from "i18n-js";
import { View } from "native-base";
import * as React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import customVariables from "../../theme/variables";
import AnimatedScreenContent from "../AnimatedScreenContent";
import TopScreenComponent from "../screens/TopScreenComponent";
import PagoPALogo from "./PagoPALogo";

type Props = Readonly<{
  title: string;
  allowGoBack: boolean;
  fixedSubHeader?: React.ReactNode;
  interpolationVars?: ReadonlyArray<number>;
  topContent?: React.ReactNode;
  hideHeader?: boolean;
  footerContent?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

const styles = StyleSheet.create({
  headerContents: {
    backgroundColor: customVariables.brandDarkGray,
    paddingHorizontal: customVariables.contentPadding
  }
});

export default class WalletLayoutNew extends React.Component<Props> {
  public render(): React.ReactNode {
    const {
      title,
      allowGoBack,
      fixedSubHeader,
      interpolationVars,
      topContent,
      hideHeader,
      footerContent,
      contentStyle
    } = this.props;

    return (
      <TopScreenComponent
        goBack={allowGoBack}
        title={title}
        dark={true}
        headerBody={<PagoPALogo />}
      >
        <AnimatedScreenContent
          hideHeader={hideHeader}
          title={title ? title : I18n.t("wallet.wallet")} // riverifica su altri screen
          icon={require("../../../img/wallet/bank.png")} // verifica se utilizzato
          dark={true}
          fixedSubHeader={fixedSubHeader}
          interpolationVars={interpolationVars}
          contentStyle={contentStyle}
        >
          <View style={styles.headerContents}>
            <View spacer={true} />
            {topContent}
          </View>

          {this.props.children}
        </AnimatedScreenContent>

        {footerContent && <View footer={true}>{footerContent}</View>}
      </TopScreenComponent>
    );
  }
}
