import { DossierTitle } from "../../../../../definitions/fci/DossierTitle";
import { SignatureRequestList } from "../../../../../definitions/fci/SignatureRequestList";
import { SignatureRequestListView } from "../../../../../definitions/fci/SignatureRequestListView";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";
import { getRandomEnumValue } from "./utils";

const now = new Date();

export const createRandomSignatureRequest = (): SignatureRequestListView => ({
  id: "mockedId" as SignatureRequestListView["id"],
  status: getRandomEnumValue(SignatureRequestStatusEnum),
  created_at: new Date(),
  dossier_id: "mockedDossierId" as SignatureRequestListView["dossier_id"],
  dossier_title: "mockedDossierTitle" as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  signer_id: "mockedSignerId" as SignatureRequestListView["signer_id"],
  updated_at: new Date()
});

export const mockedRandomSignatureRequestList: SignatureRequestList = {
  items: Array.from({ length: 5 }, () =>
    createRandomSignatureRequest()
  ) as Array<SignatureRequestListView>
};
