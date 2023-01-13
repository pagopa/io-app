import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, View } from "react-native";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { IOStyles } from "../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import Markdown from "../../components/ui/Markdown";
import I18n from "../../i18n";
import {
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import themeVariables from "../../theme/variables";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { showToast } from "../../utils/showToast";

const styles = StyleSheet.create({
  container: {
    paddingLeft: themeVariables.contentPadding,
    paddingRight: themeVariables.contentPadding
  }
});

/**
 * A screen to explain how profile data export works.
 * Here user can ask to download his data
 */
const DownloadProfileDataScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useNavigation();
  const userDataProcessing = useIOSelector(userDataProcessingSelector);
  const prevUserDataProcessing = usePrevious(userDataProcessing);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);
  const isLoading =
    pot.isLoading(userDataProcessing.DOWNLOAD) ||
    pot.isUpdating(userDataProcessing.DOWNLOAD);

  useEffect(() => {
    // the request to download has been done
    if (
      prevUserDataProcessing &&
      pot.isUpdating(prevUserDataProcessing.DOWNLOAD) &&
      pot.isSome(userDataProcessing.DOWNLOAD)
    ) {
      if (pot.isError(userDataProcessing.DOWNLOAD)) {
        showToast(I18n.t("profile.main.privacy.exportData.error"));
        return;
      }
      navigation.goBack();
    }
  }, [prevUserDataProcessing, userDataProcessing, navigation]);

  const handleDownloadPress = () => {
    Alert.alert(
      I18n.t("profile.main.privacy.exportData.alert.requestTitle"),
      undefined,
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel",
          onPress: () =>
            dispatch(
              resetUserDataProcessingRequest(
                UserDataProcessingChoiceEnum.DOWNLOAD
              )
            )
        },
        {
          text: I18n.t("global.buttons.continue"),
          style: "default",
          onPress: () =>
            dispatch(
              upsertUserDataProcessing.request(
                UserDataProcessingChoiceEnum.DOWNLOAD
              )
            )
        }
      ]
    );
  };

  return (
    <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={0.9}>
      <BaseScreenComponent
        goBack={true}
        headerTitle={I18n.t("profile.main.privacy.exportData.title")}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScreenContent
            title={I18n.t("profile.main.privacy.exportData.title")}
            subtitle={I18n.t("profile.main.privacy.exportData.info.title")}
          >
            <View style={styles.container}>
              <Markdown onLoadEnd={() => setIsMarkdownLoaded(true)}>
                {I18n.t("profile.main.privacy.exportData.info.body")}
              </Markdown>
            </View>
          </ScreenContent>
          {isMarkdownLoaded && (
            <FooterWithButtons
              type={"SingleButton"}
              leftButton={{
                block: true,
                primary: true,
                onPress: handleDownloadPress,
                title: I18n.t("profile.main.privacy.exportData.cta")
              }}
            />
          )}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

export default DownloadProfileDataScreen;
