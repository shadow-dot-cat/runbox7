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

import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-contact-form-control-custom-select-field',
    template: `
<mat-form-field *ngIf="!promptShown; else showPrompt">
    <mat-label> {{ name | titlecase }}s </mat-label>
    <mat-select [formControl]="inputFC" placeholder="No {{ name }}s" multiple>
        <mat-select-trigger>
            <span *ngIf="inputFC.value; else no_groups">
                {{ inputFC.value }}
            </span>
            <ng-template #no_groups>
                No {{ name }}s
            </ng-template>
        </mat-select-trigger>
        <mat-option *ngFor="let option of options" [value]="option">
            {{ option }}
        </mat-option>
        <mat-option (click)="showNewPrompt()"> Add a new {{ name }}... </mat-option>
    </mat-select>
</mat-form-field>
<ng-template #showPrompt>
    <mat-form-field>
        <input matInput #newInput placeholder="New {{ name }}"
              [(ngModel)]="newValue" [ngModelOptions]="{standalone: true}"
              (keydown.enter)="confirmNew()">
        <button matSuffix mat-icon-button (click)="promptShown = false">
            <mat-icon>cancel</mat-icon>
        </button>
        <button matSuffix mat-icon-button (click)="confirmNew()">
            <mat-icon>check</mat-icon>
        </button>
    </mat-form-field>
</ng-template>
    `,
})
export class FormControlCustomSelectFieldComponent implements OnInit {
    @Input() name: string;
    @Input() options: string[];
    @Input() inputFC: FormControl;
    @Output() customEntered = new EventEmitter<string>();

    @ViewChild('newInput') inputElement: ElementRef;

    newValue = '';
    promptShown = false;

    constructor() {
    }

    ngOnInit() {
        // make sure that the provided values are among the options; if not, add them
        for (const value of this.inputFC.value) {
            if (!this.options.find(o => o === value)) {
                this.options.push(value);
            }
        }
    }

    showNewPrompt() {
        // clear the newly added 'undefined' from input
        let options = this.inputFC.value;
        options = options.filter(c => c);
        this.inputFC.setValue(options);

        this.promptShown = true;
        setTimeout(() => this.inputElement.nativeElement.focus());
    }

    confirmNew() {
        this.customEntered.emit(this.newValue);
        this.promptShown = false;
        this.newValue = '';
    }
}
