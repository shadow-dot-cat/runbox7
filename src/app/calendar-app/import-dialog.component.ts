// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2019 Runbox Solutions AS (runbox.com).
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

import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import * as moment from 'moment';
import { RunboxCalendar } from './runbox-calendar';
import { RunboxCalendarEvent } from './runbox-calendar-event';
import { EventOverview } from './event-overview';

@Component({
    selector: 'app-import-dialog-component',
    templateUrl: 'import-dialog.component.html',
})
export class ImportDialogComponent {
    ical:      string;
    calendars: RunboxCalendar[];
    events:    EventOverview[];

    target = new FormControl('', Validators.required);

    extractedCalendar: RunboxCalendar;

    constructor(
        private dialog: MatDialog,
        public dialogRef: MatDialogRef<ImportDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.calendars = data['calendars'];
        this.ical      = data['ical'];

        // Some .ics represent entire calendars,
        // let's try to see if that's one of them
        // and offer that (new) calendar as an import target
        const calNameMatch = this.ical.match(/^X-WR-CALNAME:(.+)$/mi);
        const calColorMatch = this.ical.match(/^X-APPLE-CALENDAR-COLOR:(.+)$/mi);
        if (calNameMatch) {
            this.extractedCalendar = new RunboxCalendar({
                displayname: calNameMatch[1],
                color: calColorMatch ? calColorMatch[1] : undefined,
            });
            this.extractedCalendar.generateID();
            if (this.calendars.find(c => c.id === this.extractedCalendar.id)) {
                this.extractedCalendar.id += moment().format('_X');
            }
            this.calendars.push(this.extractedCalendar);
        }

        const event = RunboxCalendarEvent.fromIcal(undefined, data['ical']);
        this.events = event.get_overview();
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    onSubmitClick(): void {
        if (this.target.invalid) {
            // an error notification doesn't pop up by itself
            // if the user never clicked the control before,
            // so let's help it a little
            this.target.markAsTouched();
            return;
        }

        if (this.extractedCalendar && this.target.value === this.extractedCalendar.id) {
            this.dialogRef.close(this.extractedCalendar);
        } else {
            this.dialogRef.close(this.target.value);
        }
    }
}
