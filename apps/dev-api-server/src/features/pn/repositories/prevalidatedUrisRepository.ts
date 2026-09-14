import { SendConfig } from "../types/sendConfig";

const defaultDurationSeconds = 15;
const repositoryConfiguration = new Map<"duration", number>();
const prevalidatedUris = new Map<string, Date>();

interface IPrevalidatedUrisRepository {
  deleteExpiredPrevalidatedUris: () => void;
  getPrevalidatedUriExpirationDate: (uri: string) => Date | undefined;
  initializeIfNeeded: (config: SendConfig) => void;
  setPrevalidatedUri: (uri: string) => void;
}

const initializeIfNeeded = (configuration: SendConfig): void => {
  if (repositoryConfiguration.get("duration") == null) {
    const duration =
      configuration.prevalidatedUrlDurationSeconds ?? defaultDurationSeconds;
    repositoryConfiguration.set("duration", duration);
  }
};

const durationInSeconds = () =>
  repositoryConfiguration.get("duration") ?? defaultDurationSeconds;

const setPrevalidatedUri = (uri: string) => {
  const durationSeconds = durationInSeconds();
  const expiresAfterDate = new Date();
  expiresAfterDate.setTime(expiresAfterDate.getTime() + durationSeconds * 1000);
  prevalidatedUris.set(uri, expiresAfterDate);
};

const getPrevalidatedUriExpirationDate = (uri: string): Date | undefined =>
  prevalidatedUris.get(uri);

const deleteExpiredPrevalidatedUris = () => {
  const uris = [...prevalidatedUris.keys()];
  uris.forEach(uri => {
    const expirationDate = prevalidatedUris.get(uri);
    if (expirationDate != null && expirationDate <= new Date()) {
      prevalidatedUris.delete(uri);
    }
  });
};

export const PrevalidatedUrisRepository: IPrevalidatedUrisRepository = {
  deleteExpiredPrevalidatedUris,
  getPrevalidatedUriExpirationDate,
  initializeIfNeeded,
  setPrevalidatedUri
};
