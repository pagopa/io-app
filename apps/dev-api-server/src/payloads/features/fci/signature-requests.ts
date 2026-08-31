import { fakerIT as faker } from "@faker-js/faker";
import { DossierTitle } from "@io-app/api-types/generated/definitions/fci/DossierTitle";
import { SignatureRequestList } from "@io-app/api-types/generated/definitions/fci/SignatureRequestList";
import { SignatureRequestListView } from "@io-app/api-types/generated/definitions/fci/SignatureRequestListView";
import { SignatureRequestStatusEnum } from "@io-app/api-types/generated/definitions/fci/SignatureRequestStatus";
import { ulid } from "ulid";

import { getRandomEnumValue } from "../../utils/random";

const now = new Date();

const createRandomSignatureRequest = (): SignatureRequestListView => ({
  id: ulid() as SignatureRequestListView["id"],
  status: getRandomEnumValue(SignatureRequestStatusEnum),
  created_at: new Date(),
  dossier_id: faker.string.uuid() as SignatureRequestListView["dossier_id"],
  dossier_title: faker.word.words(5) as DossierTitle,
  expires_at: new Date(now.setDate(now.getDate() + 30)),
  signer_id: ulid() as SignatureRequestListView["signer_id"],
  updated_at: new Date()
});

export const signatureRequestList: SignatureRequestList = {
  items: Array.from({ length: 5 }, () =>
    createRandomSignatureRequest()
  ) as Array<SignatureRequestListView>
};
