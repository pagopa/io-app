import {
  Body,
  FeatureInfo,
  IOMarkdownLite,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { SpidIdp } from "../../../../utils/idps";

const POSTE_ID_IDP_ID = "https://posteid.poste.it";

/**
 * Educational bottom sheet about the PosteID App2App flow. `presentOnce` shows
 * it only when `idp` is PosteID and at most once per hook lifetime, so it can
 * be safely called on every WebView load.
 */
export const useOneIdentityPosteIDApp2AppEducational = (idp: SpidIdp) => {
  const presentedRef = useRef(false);
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

  const { bottomSheet, present } = useIOBottomSheetModal({
    title: I18n.t("authentication.idp_login.poste_id.bottom_sheet.title"),
    component: bottomSheetContent
  });

  const presentOnce = useCallback(() => {
    if (idp.id === POSTE_ID_IDP_ID && !presentedRef.current) {
      presentedRef.current = true;
      present();
    }
  }, [idp.id, present]);

  return { bottomSheet, presentOnce };
};
