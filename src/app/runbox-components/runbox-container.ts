// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2021 Runbox Solutions AS (runbox.com).
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
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationStart, Router } from '@angular/router';
import { MobileQueryService } from '../mobile-query.service';
import { RunboxSidenavService } from './runbox-sidenav.service';

@Component({
    selector: 'app-runbox-container',
    templateUrl: './runbox-container.html',
    providers: [RunboxSidenavService],
})

export class RunboxContainerComponent {
    @ViewChild(MatSidenav) sideMenu: MatSidenav;
    sideMenuOpened = true;

    constructor(
        public  mobileQuery:    MobileQueryService,
        private sidenavService: RunboxSidenavService,
                router:         Router,
    ) {
        this.sidenavService.sideMenuOpenSubject.next(!mobileQuery.matches);
        this.mobileQuery.changed.subscribe((mobile: any) => {
            this.sidenavService.sideMenuOpenSubject.next(!mobile);
        });
        this.sidenavService.sidenavChangeState.subscribe((state) => {
            this.sideMenuOpened = state;
        });

        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (mobileQuery.matches) {
                    this.sidenavService.closeSidenav();
                }
            }
        });
    }
}
