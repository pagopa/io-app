/**
 * Proxy client using apisauce
 */

import apisauce from "apisauce";

import { apiUrlPrefix as proxyBaseURL } from "../config";
import { IApiProfile, IInstallation, WithOnlyVersionRequired } from "./types";

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
    return api.get<IApiProfile>("api/v1/profile");
  };

  const updateProfile = (newProfile: WithOnlyVersionRequired<IApiProfile>) => {
    return api.post<IApiProfile>("api/v1/profile", JSON.stringify(newProfile));
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
