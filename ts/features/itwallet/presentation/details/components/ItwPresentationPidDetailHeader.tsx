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
import { getLuminance } from "../../../../../utils/color";
import { useItWalletTheme } from "../../../common/utils/theme";

export const ItwPresentationPidDetailHeader = () => {
  const theme = useItWalletTheme();

  return (
    <>
      <FocusAwareStatusBar
        backgroundColor={theme["header-background"]}
        barStyle={
          getLuminance(theme["header-background"]) < 0.5
            ? "light-content"
            : "dark-content"
        }
      />
      <View
        style={[
          styles.scrollHack,
          { backgroundColor: theme["header-background"] }
        ]}
      >
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
};

const styles = StyleSheet.create({
  content: {
    paddingVertical: IOAppMargin[1]
  },
  /** Hack to remove the white band when scrolling on iOS devices  */
  scrollHack: {
    paddingTop: 300,
    marginTop: -300
  }
});
