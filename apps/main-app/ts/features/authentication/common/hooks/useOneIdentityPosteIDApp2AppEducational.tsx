import {
  Body,
  FeatureInfo,
  IOMarkdownLite,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";

import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { SpidIdp } from "../../../../utils/idps";

const POSTE_ID_IDP_ID = "https://posteid.poste.it";

type Props = {
  idp: SpidIdp;
  isWebViewLoaded: boolean;
};

export const useOneIdentityPosteIDApp2AppEducational = ({
  idp,
  isWebViewLoaded
}: Props) => {
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

  useEffect(() => {
    if (
      idp.id === POSTE_ID_IDP_ID &&
      isWebViewLoaded &&
      !presentedRef.current
    ) {
      presentedRef.current = true;
      present();
    }
  }, [idp.id, isWebViewLoaded, present]);

  return bottomSheet;
};
