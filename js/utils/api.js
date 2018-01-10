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
  created_at: number,
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
  placeofbirth?: string
}

async function getUserProfile(
  apiUrlPrefix: string,
  token: string
): Promise<?ApiUserProfile> {
  try {
    let response = await fetch(`${apiUrlPrefix}/api/v1/profile`, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    let responseJson: ApiUserProfile = await response.json()
    return responseJson
  } catch (error) {
    // TODO handle error
    // console.error(error)
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
  isDemoIdp
}
