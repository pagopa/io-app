import apisauce from "apisauce";

import { apiUrlPrefix as proxyBaseURL } from "../config";

export type Versionable = {
  version: number;
};

export type WithOnlyVersionRequired<T> = Partial<T> & Versionable;

export type ApiProfile = {
  is_inbox_enabled: boolean;
} & Versionable;

export interface IInstallation {
  uuid: string;
  token: string;
  platform: string;
}

const create = () => {
  const api = apisauce.create({
    baseURL: proxyBaseURL,
    timeout: 1500
  });

  const setBearerToken = (token: string) => {
    api.setHeader("Authorization", `Bearer ${token}`);
    return Promise.resolve();
  };

  const unsetBearerToken = () => {
    api.deleteHeader("Authorization");
    return Promise.resolve();
  };

  const updateInstallation = (installation: IInstallation) => {
    return api.put(`api/v1/installations/${installation.uuid}`, {
      platform: installation.platform,
      pushChannel: installation.token
    });
  };

  const readProfile = () => {
    return api.get<ApiProfile>("api/v1/profile");
  };

  const updateProfile = (newProfile: WithOnlyVersionRequired<ApiProfile>) => {
    return api.post<ApiProfile>("api/v1/profile", JSON.stringify(newProfile));
  };

  return {
    setBearerToken,
    unsetBearerToken,
    updateInstallation,
    readProfile,
    updateProfile
  };
};

export default {
  create
};
