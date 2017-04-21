/**
 * @flow
 */

'use strict'

export type ApiUserProfile = {
  created_at: number,
  token: string,
  spid_idp: string,
  name?: string,
  familyname?: string,
  fiscalnumber?: string,
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
}

async function getUserProfile(apiUrlPrefix: string, token: string) {
  try {
    let response = await fetch(`${apiUrlPrefix}/api/v1/user`, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    let responseJson = await response.json()
    return responseJson
  } catch(error) {
    // console.error(error)
  }
}

module.exports = {
  getUserProfile
}
