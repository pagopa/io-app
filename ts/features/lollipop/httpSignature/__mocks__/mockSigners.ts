import sha from "sha.js";
import { constants } from "../constants";
import { Signer } from "../types/Signer";

export const mockSigner: Signer = {
  sign(payload: string, keyTag: string): Promise<string> {
    return new Promise<string>((resolve, _) => {
      resolve(
        // Just to have a base64 valid string
        sha(constants.SHA_256)
          .update(payload + keyTag)
          .digest(constants.BASE64)
      );
    });
  }
};

export const brokenMockSigner: Signer = {
  sign(payload: string, keyTag: string): Promise<string> {
    return new Promise<string>((_, reject) => {
      reject(
        `I'm a broken signer, you can't use me to sign ${payload} with ${keyTag}!`
      );
    });
  }
};
