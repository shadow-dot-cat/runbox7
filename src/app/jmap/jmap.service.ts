// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2024 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
//import { JamClient } from "jmap-jam";
import * as oauth from 'openid-client';

@Injectable({ providedIn: 'root' })
export class JMAPService {
  // public jam: JamClient;
  public accountId: string;

  // settings, should be fetched from server !
  private stalwartHost = new URL('https://mail.stalbox.net');
  private myHost = 'http://mallet3.scsys.co.uk:4200';
  
  constructor(
  ) {
    // this.jam = new JamClient({
    //   sessionUrl: 'https://mail.stalbox.net/.well-known/jmap',
    //   bearerToken: 'dGVzdDp2YWk0aWVUZTFxdXVWaWU1',
    // });
    // this.accountId = await this.jam.getPrimaryAccount();

//    this.oauthLogin(this.stalwartHost);
  }

  public async oauthLogin() {
    //  + '/.well-known/oauth-authorization-server' ?
    let config: oauth.Configuration = await oauth.discovery(
      this.stalwartHost,
      'runbox7', 'secret',undefined, { "algorithm":"oauth2" }
    );
    console.log(config);

    // device flow for laziness !
    // "scopes_supported":["openid","offline_access","urn:ietf:params:jmap:core","urn:ietf:params:jmap:mail","urn:ietf:params:jmap:submission","urn:ietf:params:jmap:vacationresponse"]
    let scope: string = 'urn:ietf:params:jmap:mail';
    let response = await oauth.initiateDeviceAuthorization(config, { scope });
    console.log(response);

    let tokens: oauth.TokenEndpointResponse =
      await oauth.pollDeviceAuthorizationGrant(config, response);

    console.log('Token Endpoint Response', tokens)
  }

}
