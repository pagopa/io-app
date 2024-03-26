import {
  BlockButtonProps,
  ContentWrapper,
  IOToast,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView } from "react-native";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { IOStyles } from "../../components/core/variables/IOStyles";
import LegacyMarkdown from "../../components/ui/Markdown/LegacyMarkdown";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
import I18n from "../../i18n";
import {
  resetUserDataProcessingRequest,
  upsertUserDataProcessing
} from "../../store/actions/userDataProcessing";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { userDataProcessingSelector } from "../../store/reducers/userDataProcessing";
import { usePrevious } from "../../utils/hooks/usePrevious";

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
        IOToast.error(I18n.t("profile.main.privacy.exportData.error"));
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

  const requestDataButtonProps: BlockButtonProps = {
    type: "Solid",
    buttonProps: {
      color: "primary",
      label: I18n.t("profile.main.privacy.exportData.cta"),
      accessibilityLabel: I18n.t("profile.main.privacy.exportData.cta"),
      onPress: handleDownloadPress
    }
  };

  return (
    <RNavScreenWithLargeHeader
      title={{
        label: I18n.t("profile.main.privacy.exportData.title"),
        testID: "share-data-component-title"
      }}
      description={I18n.t("profile.main.privacy.exportData.info.title")}
      fixedBottomSlot={
        isMarkdownLoaded && (
          <FooterWithButtons
            type={"SingleButton"}
            primary={requestDataButtonProps}
          />
        )
      }
    >
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={0.9}>
        <SafeAreaView style={IOStyles.flex}>
          <ContentWrapper>
            <LegacyMarkdown onLoadEnd={() => setIsMarkdownLoaded(true)}>
              {I18n.t("profile.main.privacy.exportData.info.body")}
            </LegacyMarkdown>
          </ContentWrapper>
        </SafeAreaView>
      </LoadingSpinnerOverlay>
    </RNavScreenWithLargeHeader>
  );
};

export default DownloadProfileDataScreen;
