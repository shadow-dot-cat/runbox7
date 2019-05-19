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

import {
    Component,
    ChangeDetectionStrategy,
    ViewChild,
    TemplateRef
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';

import {
    MatDialog,
    MatSnackBar
} from '@angular/material';

import {
    isSameDay,
    isSameMonth,
} from 'date-fns';

import { Subject } from 'rxjs';

import {
    CalendarEvent,
    CalendarEventTimesChangedEvent,
    CalendarEventTitleFormatter,
    CalendarView
} from 'angular-calendar';

import { RunboxWebmailAPI } from '../rmmapi/rbwebmail';
import { RunboxCalendar } from './runbox-calendar';
import { RunboxCalendarEvent } from './runbox-calendar-event';
import { EventEditorDialogComponent } from './event-editor-dialog.component';
import { CalendarEditorDialogComponent } from './calendar-editor-dialog.component';
import { EventTitleFormatter } from './event-title-formatter';

@Component({
    selector: 'app-calendar-app-component',
    templateUrl: './calendar-app.component.html',
    providers: [
        { provide: CalendarEventTitleFormatter, useClass: EventTitleFormatter }
    ]
})
export class CalendarAppComponent {
    view: CalendarView = CalendarView.Month;
    CalendarView = CalendarView;
    viewDate: Date = new Date();
    activeDayIsOpen = false;

    refresh: Subject<any> = new Subject();

    calendars: RunboxCalendar[] = [];

    events:       RunboxCalendarEvent[] = [];
    shown_events: RunboxCalendarEvent[] = [];

    constructor(
        private dialog:   MatDialog,
        private rmmapi:   RunboxWebmailAPI,
        private snackBar: MatSnackBar,
    ) {
        console.log('Fetching calendars and events');
        this.rmmapi.getCalendars().subscribe(calendars => {
            console.log('Calendars loaded:', calendars);
            for (const c of calendars) {
                this.calendars.push(c);
            }
            this.updateEventColors();
        }, e => this.showError(e));
        this.rmmapi.getCalendarEvents().subscribe(events => {
            console.log('Calendar events:', events);
            this.events = [];
            for (const e of events) {
                this.events.push(new RunboxCalendarEvent(e));
            }
            console.log('Processed events:', this.events);
            this.updateEventColors();
            this.filterEvents();
        }, e => this.showError(e));
    }

    showAddCalendarDialog(): void {
        const dialogRef = this.dialog.open(CalendarEditorDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            console.log('Dialog result:', result);
            if (!result) { return; }

            result.generateID();

            this.rmmapi.addCalendar(result).subscribe(() => {
                console.log('Calendar created!');
                this.calendars.push(result);
            }, e => this.showError(e));
        });
    }

    editCalendar(calendar_id: string): void {
        let cal = this.calendars.find(c => c.id === calendar_id);
        // edit a copy so that edit cancellation is possible
        cal = new RunboxCalendar(cal);

        const dialogRef = this.dialog.open(CalendarEditorDialogComponent, { data: cal });
        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            console.log('Dialog result:', result);
            if (result === 'DELETE') {
                this.rmmapi.deleteCalendar(cal.id).subscribe(() => {
                    console.log('Calendar deleted:', cal.id);
                    const idx = this.calendars.findIndex(c => c.id === cal.id);
                    this.calendars.splice(idx, 1);
                }, e => this.showError(e));
            } else {
                this.rmmapi.modifyCalendar(result).subscribe(() => {
                    console.log('Calendar edited:', result['id']);
                    const idx = this.calendars.findIndex(c => c.id === result['id']);
                    this.calendars.splice(idx, 1, result);
                }, e => this.showError(e));
                this.updateEventColors();
            }
        });
    }

    toggleCalendar(calendar_id: string): void {
        const cal = this.calendars.find(c => c.id === calendar_id);
        cal.shown = !cal.shown;
        this.filterEvents();
    }

    filterEvents(): void {
        if (this.calendars.length === 0) {
            console.log('Calendars not loaded yet, showing all events');
            this.shown_events = this.events;
        } else {
            const visible = {};
            for (const c of this.calendars) {
                visible[c.id] = c.shown;
            }

            this.shown_events = [];
            for (const e of this.events) {
                if (visible[e.calendar]) {
                    this.shown_events.push(e);
                }
            }
        }

        this.refresh.next();
    }

    dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
        if (isSameMonth(date, this.viewDate)) {
            this.viewDate = date;
            if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen ) || events.length === 0) {
                this.activeDayIsOpen = false;
            } else {
                this.activeDayIsOpen = true;
            }
        }
    }

    eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
        event.start = newStart;
        event.end = newEnd;
        console.log('Event changed', event);
        this.rmmapi.modifyCalendarEvent(event as RunboxCalendarEvent).subscribe(
            res => {
                console.log('Event updated:', res);
                this.filterEvents();
            }, e => this.showError(e)
        );
    }

    openEvent(event: CalendarEvent): void {
        console.log('Opening event', event);
        const dialogRef = this.dialog.open(EventEditorDialogComponent, { data: { event: event, calendars: this.calendars } });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'DELETE') {
                this.rmmapi.deleteCalendarEvent(event.id).subscribe(
                    res => {
                        console.log('Event deleted:', res);
                        const idx = this.events.findIndex(e => e.id === event.id);
                        this.events.splice(idx, 1);
                        this.filterEvents();
                    }, e => this.showError(e)
                );
            } else if (result) {
                console.log('Updating event:', result);
                this.rmmapi.modifyCalendarEvent(result).subscribe(
                    res => {
                        console.log('Event updated:', res);
                        const idx = this.events.findIndex(e => e.id === result.id);
                        this.events.splice(idx, 1, result);
                        this.filterEvents();
                    }, e => this.showError(e)
                );
            }
        });
    }

    addEvent(): void {
        const dialogRef = this.dialog.open(EventEditorDialogComponent, { data: { calendars: this.calendars } });
        dialogRef.afterClosed().subscribe(event => {
            console.log('Dialog result:', event);
            if (event) {
                this.rmmapi.addCalendarEvent(event).subscribe(res => {
                    console.log('Event created:', res);
                    event.id = res.id;
                    this.events.push(event);
                    this.filterEvents();
                });
            }
        });
    }

    showError(e: HttpErrorResponse): void {
        let message = '';

        if (e.status === 500) {
            message = 'Internal server error';
        } else {
            console.log('Error ' + e.status +  ': ' + e.message);
        }

        if (message) {
            this.snackBar.open(message, 'Ok :(', {
                duration: 5000,
            });
        }
    }

    updateEventColors(): void {
        const calendar_color = {};
        for (const c of this.calendars) {
            calendar_color[c.id] = c.color;
        }

        for (const e of this.events) {
            e.color.primary = calendar_color[e.calendar];
        }
    }
}