import { View } from "native-base";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { RawCheckBox } from "../../../../../../components/core/selection/checkbox/RawCheckBox";
import { Body } from "../../../../../../components/core/typography/Body";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import i18n from "../../../../../../i18n";
import { useIODispatch } from "../../../../../../store/hooks";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { MvlAttachment } from "../../../../types/mvlData";
import { handleDownloadResult } from "../../../../utils";
import { mvlPreferencesSetWarningForAttachments } from "../../../../store/actions";
import customVariables from "../../../../../../theme/variables";
import { H4 } from "../../../../../../components/core/typography/H4";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../../../components/ui/LightModal";
import { showToast } from "../../../../../../utils/showToast";
import { useIOBottomSheetModal } from "../../../../../../utils/hooks/bottomSheet";
import PdfPreview from "./PdfPreview";

const BOTTOM_SHEET_HEIGHT = 375;

const styles = StyleSheet.create({
  activityIndicator: {
    padding: 36
  },
  loaderContainer: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    marginTop: BOTTOM_SHEET_HEIGHT / 7
  }
});

type Props = {
  /**
   * Initial configuration for user preferences
   */
  initialPreferences: { dontAskAgain: boolean };

  /**
   *  Called on right-button press with the user's selected preferences
   *  (see also {@link initialPreferences}).
   *  The promise is waited until fulfilled and a loader is shown.
   */
  onConfirm: (preferences: { dontAskAgain: boolean }) => Promise<void>;

  /**
   * The user canceled the action via the UI.
   */
  onCancel: () => void;

  /**
   * When true, invoke onConfirm immediately and show a loader.
   */
  withoutConfirmation: boolean;
};

const DownloadAttachmentConfirmationBottomSheet = ({
  initialPreferences,
  onConfirm,
  onCancel,
  withoutConfirmation
}: Props): React.ReactElement => {
  const [dontAskAgain, setDontAskAgain] = useState<boolean>(
    initialPreferences.dontAskAgain
  );
  const [isLoading, setIsLoading] = useState<boolean>(withoutConfirmation);
  const [downloadError, setDownloadError] = useState<Error | null>(null);

  const performDownload = useCallback(() => {
    setIsLoading(true);
    onConfirm({ dontAskAgain })
      .catch((error: Error) => {
        // TODO: log the error
        setDownloadError(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dontAskAgain, onConfirm, setDownloadError]);

  useEffect(() => {
    if (withoutConfirmation) {
      void performDownload();
    }
  }, [withoutConfirmation, performDownload]);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator
          animating={true}
          size={"large"}
          style={styles.activityIndicator}
          color={customVariables.brandPrimary}
          accessible={true}
          accessibilityHint={i18n.t(
            "global.accessibility.activityIndicator.hint"
          )}
          accessibilityLabel={i18n.t(
            "global.accessibility.activityIndicator.label"
          )}
          importantForAccessibility={"no-hide-descendants"}
          testID={"activityIndicator"}
        />
        <H4 weight={"Regular"}>
          {i18n.t("features.mvl.details.attachments.bottomSheet.loading.body")}
        </H4>
      </View>
    );
  }

  if (downloadError) {
    return (
      <View>
        <View spacer={true} />
        <H4 weight={"Regular"}>
          {i18n.t("features.mvl.details.attachments.bottomSheet.failing.body")}
        </H4>
        <Body>
          {i18n.t(
            "features.mvl.details.attachments.bottomSheet.failing.details"
          )}
        </Body>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={{
            ...cancelButtonProps(onCancel),
            onPressWithGestureHandler: true
          }}
          rightButton={{
            ...confirmButtonProps(() => {
              setDownloadError(null);
              void performDownload();
            }, i18n.t("global.buttons.retry")),
            onPressWithGestureHandler: true
          }}
        />
      </View>
    );
  }

  return (
    <View>
      <View spacer={true} />
      <Body>
        {i18n.t("features.mvl.details.attachments.bottomSheet.warning.body")}
      </Body>
      <View spacer={true} />
      <View style={IOStyles.row}>
        <RawCheckBox
          checked={dontAskAgain}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        />
        <Body
          style={{ paddingLeft: 8 }}
          onPress={() => setDontAskAgain(!dontAskAgain)}
        >
          {i18n.t("features.mvl.details.attachments.bottomSheet.checkBox")}
        </Body>
      </View>
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          ...cancelButtonProps(onCancel),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...confirmButtonProps(() => {
            void performDownload();
          }, i18n.t("global.buttons.continue")),
          onPressWithGestureHandler: true
        }}
      />
    </View>
  );
};

export const useDownloadAttachmentConfirmationBottomSheet = (
  attachment: MvlAttachment,
  authHeader: { [key: string]: string },
  options: { dontAskAgain: boolean; showToastOnSuccess: boolean }
) => {
  const dispatch = useIODispatch();
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <DownloadAttachmentConfirmationBottomSheet
      onCancel={() => dismiss()}
      onConfirm={({ dontAskAgain }) => {
        dispatch(mvlPreferencesSetWarningForAttachments(!dontAskAgain));
        return handleDownloadResult(
          attachment,
          authHeader,
          (path, actionConfig) =>
            showAnimatedModal(
              <PdfPreview
                path={path}
                onClose={hideModal}
                onError={_error => {
                  dismiss();
                  showToast(
                    i18n.t(
                      "features.mvl.details.attachments.bottomSheet.failing.details"
                    )
                  );
                }}
                actionConfig={actionConfig}
              />,
              BottomTopAnimation
            )
        ).then(() => dismiss());
      }}
      initialPreferences={options}
      withoutConfirmation={options.dontAskAgain}
    />,
    options.dontAskAgain
      ? i18n.t("features.mvl.details.attachments.bottomSheet.loading.title")
      : i18n.t("features.mvl.details.attachments.bottomSheet.warning.title"),
    BOTTOM_SHEET_HEIGHT
  );

  return { present, bottomSheet, dismiss };
};
