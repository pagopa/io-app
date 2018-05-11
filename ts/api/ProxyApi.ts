/**
 * Proxy client using apisauce
 */

import apisauce, { ApiResponse } from "apisauce";

import { apiDefaultTimeoutMs, apiUrlPrefix as proxyBaseURL } from "../config";
import { IApiProfile, IInstallation, WithOnlyVersionRequired } from "./types";

const api = apisauce.create({
  baseURL: proxyBaseURL,
  timeout: apiDefaultTimeoutMs
});

function setBearerToken(token: string): void {
  api.setHeader("Authorization", `Bearer ${token}`);
}

function unsetBearerToken(): void {
  api.deleteHeader("Authorization");
}

function updateInstallation(
  installation: IInstallation
): Promise<ApiResponse<void>> {
  return api.put(`api/v1/installations/${installation.uuid}`, {
    platform: installation.platform,
    pushChannel: installation.token
  });
}

function readProfile(): Promise<ApiResponse<IApiProfile>> {
  return api.get<IApiProfile>("api/v1/profile");
}

function updateProfile(
  newProfile: WithOnlyVersionRequired<IApiProfile>
): Promise<ApiResponse<IApiProfile>> {
  return api.post<IApiProfile>("api/v1/profile", JSON.stringify(newProfile));
}

export default {
  setBearerToken,
  unsetBearerToken,
  updateInstallation,
  readProfile,
  updateProfile
};
