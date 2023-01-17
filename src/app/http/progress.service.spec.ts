// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2018 Runbox Solutions AS (runbox.com).
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

import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RunboxWebmailAPI } from '../rmmapi/rbwebmail';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RMMHttpInterceptorService } from '../rmmapi/rmmhttpinterceptor.service';
import { ProgressService } from './progress.service';
import { RouterTestingModule } from '@angular/router/testing';
import { filter, take } from 'rxjs/operators';
import { RMMAuthGuardService } from '../rmmapi/rmmauthguard.service';
import { RMMOfflineService } from '../rmmapi/rmmoffline.service';
import { MessageCache } from '../rmmapi/messagecache';

describe('ProgressService', () => {
    let rmmapiservice: RunboxWebmailAPI;
    let progressService: ProgressService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
        imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                MatDialogModule,
                NoopAnimationsModule,
                RouterTestingModule,
            ],
        providers: [
            RMMOfflineService,
            RunboxWebmailAPI,
            MessageCache,
            RMMAuthGuardService,
            ProgressService,
            { provide: HTTP_INTERCEPTORS, useClass: RMMHttpInterceptorService, multi: true}
        ]
        });
        rmmapiservice = TestBed.inject(RunboxWebmailAPI);
        progressService = TestBed.inject(ProgressService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should indicate http request activity', waitForAsync( async() => {

        let httpProgressSeen = false;
        progressService.httpRequestInProgress.pipe(
            filter(c => c === true ? true : false),
            take(1)
        ).subscribe(() => httpProgressSeen = true);

        const me = await rmmapiservice.me.toPromise();
        expect(me.last_name).toBe('testuser');

        expect(httpProgressSeen).toBeTruthy();

        const hasCurrentHttpActivity = await progressService.httpRequestInProgress.pipe(
            take(1)
        ).toPromise();

        expect(hasCurrentHttpActivity).toBeFalsy();
        expect(rmmapiservice.last_on_interval).toBeTruthy();
        clearInterval(rmmapiservice.last_on_interval);
    }));
});
