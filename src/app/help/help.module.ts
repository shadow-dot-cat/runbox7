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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RunboxComponentModule } from '../runbox-components/runbox-component.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HelpComponent } from './help.component';
import { RouterModule } from '@angular/router';
import { HeaderToolbarComponent } from '../menu/headertoolbar.component';

@NgModule({
  declarations: [HelpComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSidenavModule,
    RunboxComponentModule,
    RouterModule.forChild([
      {
        path: 'help',
        children: [
          {
            path: '', outlet: 'headertoolbar',
            component: HeaderToolbarComponent
          },
          {
            path: '',
            component: HelpComponent,
          }
        ]
      }
    ])
  ]
})

export class HelpModule { }
