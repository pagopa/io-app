import { fakerIT as faker } from "@faker-js/faker";
import { ulid } from "ulid";

import { DossierTitle } from "../../../../generated/definitions/fci/DossierTitle";
import { SignatureRequestList } from "../../../../generated/definitions/fci/SignatureRequestList";
import { SignatureRequestListView } from "../../../../generated/definitions/fci/SignatureRequestListView";
import { SignatureRequestStatusEnum } from "../../../../generated/definitions/fci/SignatureRequestStatus";
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
