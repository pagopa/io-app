import { Body, FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import I18n from "i18next";
import IOMarkdown from "../../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { SpidIdp } from "../../../../../utils/idps";
import { StandardLoginRequestInfo } from "../store/types";

type Props = {
  selectedIdp?: SpidIdp;
  requestState: StandardLoginRequestInfo["requestState"];
};

export const usePosteIDApp2AppEducational = ({
  selectedIdp,
  requestState
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
          iconName="logout"
          body={
            <IOMarkdown
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_1"
              )}
            />
          }
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="fingerprint"
          body={
            <IOMarkdown
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_2"
              )}
            />
          }
        />
        <VSpacer size={24} />
        <FeatureInfo
          iconName="change"
          body={
            <IOMarkdown
              content={I18n.t(
                "authentication.idp_login.poste_id.bottom_sheet.feature_3"
              )}
            />
          }
        />
        <VSpacer size={24} />
      </View>
    ),
    []
  );

  const handleOnDismiss = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    presentedRef.current = true;
  }, []);

  const { bottomSheet, present } = useIOBottomSheetModal({
    title: I18n.t("authentication.idp_login.poste_id.bottom_sheet.title"),
    component: bottomSheetContent,
    onDismiss: handleOnDismiss
  });

  useEffect(() => {
    if (
      selectedIdp?.id === "posteid" &&
      !pot.isError(requestState) &&
      !pot.isLoading(requestState) &&
      !presentedRef.current
    ) {
      present();
    }
  }, [selectedIdp?.id, present, requestState]);

  return bottomSheet;
};
