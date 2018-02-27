/**
 * Implements the APIs to interact with the backend.
 *
 * @flow
 */

'use strict'

/**
 * The user profile
 */
export type ApiUserProfile = {
  token: string,
  spid_idp: string,
  name?: string,
  familyname?: string,
  fiscal_code?: string,
  spidcode?: string,
  gender?: string,
  mobilephone?: string,
  email?: string,
  address?: string,
  expirationdate?: string,
  digitaladdress?: string,
  countyofbirth?: string,
  dateofbirth?: string,
  idcard?: string,
  placeofbirth?: string,
  is_inbox_enabled?: boolean,
  version?: number
}

async function getUserProfile(
  apiUrlPrefix: string,
  token: string
): Promise<?ApiUserProfile> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const responseJson: ApiUserProfile = await response.json()
    return responseJson
  } catch (error) {
    // TODO handle error
    // console.error(error)
  }
}

async function setUserProfile(
  apiUrlPrefix: string,
  token: string,
  newProfile: ApiUserProfile
): Promise<?ApiUserProfile | number> {
  try {
    const response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: 'post',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: newProfile.email,
        is_inbox_enabled: newProfile.is_inbox_enabled,
        version: newProfile.version
      })
    })

    if (response.status == 500) {
      return response.status
    } else {
      const responseJson: ApiUserProfile = await response.json()
      return responseJson
    }
  } catch (error) {
    // if the proxy is not reacheable
    // TODO handle unsuccessful fetch
    // @see https://www.pivotaltracker.com/story/show/154661120
  }
}

/**
 * Describes a SPID Identity Provider
 */
export type IdentityProvider = {
  id: string,
  logo: mixed,
  name: string,
  entityID: string,
  profileUrl: string
}

function isDemoIdp(idp: IdentityProvider): boolean {
  return idp.id === 'demo'
}

module.exports = {
  getUserProfile,
  setUserProfile,
  isDemoIdp
}
