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
import { IT_WALLET_BG } from "../../../common/utils/constants";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { ItwPresentationDetailsScreenBase } from "./ItwPresentationDetailsScreenBase";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationPidScaffoldScreen = ({
  credential,
  children
}: PropsWithChildren<Props>) => (
  <ItwPresentationDetailsScreenBase credential={credential}>
    <FocusAwareStatusBar backgroundColor={IT_WALLET_BG} />
    <View style={[styles.header, styles.scrollHack]}>
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

const styles = StyleSheet.create({
  header: {
    backgroundColor: IT_WALLET_BG
  },
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
