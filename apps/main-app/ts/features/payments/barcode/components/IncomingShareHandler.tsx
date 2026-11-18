import { IOToast } from "@io-app/design-system";
import * as Sharing from "@io-app/expo-share-pdf";
import I18n from "i18next";
import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";

import NavigationService from "../../../../navigation/NavigationService";
import { useIOSelector } from "../../../../store/hooks";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../store/reducers/startup";
import { progressSelector } from "../../../identification/store/selectors";
import { PaymentsBarcodeRoutes } from "../navigation/routes";
import {
  IncomingShare,
  isIncomingShareUrl,
  parseIncomingShare
} from "../utils/incomingShare";

export const IncomingShareHandler = ({ isReady }: { isReady: boolean }) => {
  const startupStatus = useIOSelector(isStartupLoaded);
  const identification = useIOSelector(progressSelector);
  const [pending, setPending] = useState<"invalid" | IncomingShare>();

  const receiveShare = useCallback(() => {
    try {
      const payloads = Sharing.getSharedPayloads();
      if (payloads.length === 0) {
        return;
      }
      const incomingShare = parseIncomingShare(payloads);
      if (!incomingShare) {
        payloads.forEach(payload => Sharing.discardSharedFile(payload.value));
      }
      setPending(incomingShare ?? "invalid");
      Sharing.clearSharedPayloads();
    } catch {
      setPending("invalid");
    }
  }, []);

  useEffect(() => {
    void Linking.getInitialURL()
      .then(url => {
        if (url && isIncomingShareUrl(url)) {
          receiveShare();
        }
      })
      .catch(() => setPending("invalid"));
    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (isIncomingShareUrl(url)) {
        receiveShare();
      }
    });
    return () => subscription.remove();
  }, [receiveShare]);

  useEffect(() => {
    if (
      !pending ||
      !isReady ||
      startupStatus !== StartupStatusEnum.AUTHENTICATED ||
      identification.kind === "started"
    ) {
      return;
    }
    setPending(undefined);
    if (pending === "invalid") {
      IOToast.error(I18n.t("barcodeScan.error"));
      return;
    }
    NavigationService.navigate(
      PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR,
      {
        screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN,
        params: { sharedFile: pending }
      }
    );
  }, [identification.kind, isReady, pending, startupStatus]);

  return null;
};
