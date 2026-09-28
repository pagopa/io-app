import {
  Body,
  FeatureInfo,
  IOMarkdownLite,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { SpidIdp } from "../../../../utils/idps";

const POSTE_ID_IDP_ID = "https://posteid.poste.it";

type WebViewLoadStatus = "failed" | "idle" | "loaded";

/**
 * Educational bottom sheet about the PosteID App2App flow, shown at most once
 * per hook lifetime when `idp` is PosteID and the login WebView has loaded.
 *
 * `onWebViewLoad` and `onWebViewError` must be wired to the WebView load and
 * (non-HTTP) error events. On Android a failed load emits `onLoad` right before
 * `onError`: presenting from an effect lets both updates settle, and a failure
 * dismisses the sheet if it was already presented.
 */
export const useOneIdentityPosteIDApp2AppEducational = (idp: SpidIdp) => {
  const presentedRef = useRef(false);
  const [loadStatus, setLoadStatus] = useState<WebViewLoadStatus>("idle");
  const bottomSheetContent = useMemo(
    () => (
      <View>
        <Body>
          {I18n.t("authentication.idp_login.poste_id.bottom_sheet.description")}
        </Body>
        <VSpacer size={24} />
        <FeatureInfo
          body={
            <IOMarkdownLite
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_1"
              )}
            />
          }
          iconName="logout"
        />
        <VSpacer size={24} />
        <FeatureInfo
          body={
            <IOMarkdownLite
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_2"
              )}
            />
          }
          iconName="fingerprint"
        />
        <VSpacer size={24} />
        <FeatureInfo
          body={
            <IOMarkdownLite
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_3"
              )}
            />
          }
          iconName="change"
        />
        <VSpacer size={24} />
      </View>
    ),
    []
  );

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    title: I18n.t("authentication.idp_login.poste_id.bottom_sheet.title"),
    component: bottomSheetContent
  });

  const onWebViewLoad = useCallback(
    () => setLoadStatus(status => (status === "idle" ? "loaded" : status)),
    []
  );

  const onWebViewError = useCallback(() => setLoadStatus("failed"), []);

  useEffect(() => {
    if (loadStatus === "failed") {
      // `dismiss` closes every sheet in the provider, so only call it for ours
      if (presentedRef.current) {
        dismiss();
      }
      return;
    }
    if (
      idp.id === POSTE_ID_IDP_ID &&
      loadStatus === "loaded" &&
      !presentedRef.current
    ) {
      presentedRef.current = true;
      present();
    }
  }, [dismiss, idp.id, loadStatus, present]);

  return { bottomSheet, onWebViewLoad, onWebViewError };
};
