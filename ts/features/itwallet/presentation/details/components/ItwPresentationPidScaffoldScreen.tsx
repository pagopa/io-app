import {
  Body,
  ContentWrapper,
  IOAppMargin,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import ITWalletIDImage from "../../../../../../img/features/itWallet/brand/itw_id.svg";
import ITWalletLogoImage from "../../../../../../img/features/itWallet/brand/itw_logo.svg";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import { getLuminance } from "../../../../../utils/color";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { useItWalletTheme } from "../../../common/utils/theme";
import { ItwPresentationDetailsScreenBase } from "./ItwPresentationDetailsScreenBase";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidScaffoldScreen = ({
  credential,
  children
}: PropsWithChildren<Props>) => {
  const itWalletTheme = useItWalletTheme();

  return (
    <ItwPresentationDetailsScreenBase credential={credential}>
      <FocusAwareStatusBar
        backgroundColor={itWalletTheme["header-background"]}
        barStyle={
          getLuminance(itWalletTheme["header-background"]) < 0.5
            ? "light-content"
            : "dark-content"
        }
      />
      <View
        style={[
          styles.scrollHack,
          { backgroundColor: itWalletTheme["header-background"] }
        ]}
      >
        <ContentWrapper>
          <VStack space={8} style={styles.content}>
            <View style={styles.logo}>
              <ITWalletLogoImage width={120} height={25} />
              <ITWalletIDImage width={46} height={32} />
            </View>
            <Body color="black">
              {I18n.t("features.itWallet.presentation.itWalletId.description")}
            </Body>
          </VStack>
        </ContentWrapper>
      </View>
      {/** TODO: [SIW-3307] Add IT-Wallet gradient line  */}
      <ContentWrapper>{children}</ContentWrapper>
    </ItwPresentationDetailsScreenBase>
  );
};

const styles = StyleSheet.create({
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  content: {
    paddingVertical: IOAppMargin[2]
  },
  /** Hack to remove the white band when scrolling on iOS devices  */
  scrollHack: {
    paddingTop: 300,
    marginTop: -300
  }
});
