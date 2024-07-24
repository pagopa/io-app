import { Alert, VStack } from "@pagopa/io-app-design-system";
import React from "react";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";
import ItwMarkdown from "../../common/components/ItwMarkdown";
import {
  getCredentialExpireDays,
  getCredentialExpireStatus
} from "../../common/utils/itwClaimsUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationBannersSection = ({ credential }: Props) => {
  const isMdl = credential.credentialType === CredentialType.DRIVING_LICENSE;

  const mdlDisclaimerBottomSheet = useIOBottomSheetAutoresizableModal({
    title: "Patente: contesti di verifica",
    component: (
      <ItwMarkdown>
        {
          "###### In quali casi posso usare la versione digitale della mia Patente di guida? \n Puoi usare la versione digitale della tua Patente per dimostrare l’idoneità alla guida durante i controlli stradali solo se **accompagnata da un documento di riconoscimento fisico valido** (es. Cartadi Identità). \n \n In questa prima fase della funzionalità infatti, la versione digitale della tua Patente **non ha ancora lo stesso valorelegale del documento fisico.**"
        }
      </ItwMarkdown>
    )
  });

  const expireStatus = getCredentialExpireStatus(credential.parsedCredential);
  const expireDays = getCredentialExpireDays(credential.parsedCredential);

  if (expireStatus === "EXPIRED") {
    return (
      <Alert
        content="Il documento non è più valido. Se sei già in possesso del nuovo documento valido, puoi aggiornare la versione digitale nel Portafoglio"
        variant="error"
        action="Aggiorna il documento"
        onPress={mdlDisclaimerBottomSheet.present}
      />
    );
  }

  return (
    <VStack space={16}>
      {expireStatus === "EXPIRING" && (
        <Alert
          content={`Mancano ${expireDays} giorni alla scadenza del documento.`}
          variant="warning"
        />
      )}
      {isMdl && (
        <>
          <Alert
            content="In questa fase, la versione digitale della Patente non ha lo stesso valore del documento fisico: dovrai presentarla insieme a un documento di identità valido."
            variant="info"
            action="Scopri di più"
            onPress={mdlDisclaimerBottomSheet.present}
          />
          {mdlDisclaimerBottomSheet.bottomSheet}
        </>
      )}
    </VStack>
  );
};
