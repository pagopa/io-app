import {
  Body,
  ContentWrapper,
  IOAppMargin,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import ITWalletIDImage from "../../../../../../img/features/itWallet/brand/itw_id_logo.svg";
import FocusAwareStatusBar from "../../../../../components/ui/FocusAwareStatusBar";
import { IT_WALLET_BG } from "../../../common/utils/constants";

export const ItwPresentationPidDetailHeader = () => (
  <>
    <FocusAwareStatusBar backgroundColor={IT_WALLET_BG} />
    <View style={[styles.header, styles.scrollHack]}>
      <ContentWrapper>
        <VStack space={8} style={styles.content}>
          <ITWalletIDImage width={140} height={34} />
          <Body>
            {I18n.t("features.itWallet.presentation.itWalletId.description")}
          </Body>
        </VStack>
      </ContentWrapper>
    </View>
  </>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: IT_WALLET_BG
  },
  content: {
    paddingVertical: IOAppMargin[1]
  },
  /** Hack to remove the white band when scrolling on iOS devices  */
  scrollHack: {
    paddingTop: 300,
    marginTop: -300
  }
});
