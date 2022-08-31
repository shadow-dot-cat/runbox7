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

import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { RMM } from '../rmm';
import { AccountDetailsInterface } from '../rmm/account-details';
import { ModalPasswordComponent } from '../account-security/account.security.component';
import { RunboxWebmailAPI } from '../rmmapi/rbwebmail';

import * as ct from 'countries-and-timezones';

interface CountryAndTimezone {
    id: string;
    name: string;
    timezones: string[];
}

@Component({
    selector: 'app-personal-details-component',
    templateUrl: './personal-details.component.html',
    styleUrls: ['account-details.component.scss'],
})
export class PersonalDetailsComponent {
    hide = true;
    myControl = new FormControl();
    countriesAndTimezones: CountryAndTimezone[] = [];
    timezones: string[];
    detailsForm = this.createForm();
    modal_password_ref;

    details: Subject<AccountDetailsInterface> = new Subject();

    selectedCountry: any;
    selectedTimezone: any;

    field_errors = [];

    constructor(
        private fb: FormBuilder,
        public dialog: MatDialog,
        public rmm: RMM,
        public rmmapi: RunboxWebmailAPI,
    ) {
        this.details.subscribe((details: AccountDetailsInterface) => {
            this.detailsForm.patchValue(details);
        });

        this.loadDetails();
        this.loadCountryList();
        this.loadTimezones();
    }

    ngOnInit() {
        if (!this.rmm.account_security.user_password) {
            this.show_modal_password();
        }
    }

    private createForm(): FormGroup {
        return this.fb.group({
            first_name: this.fb.control(''),
            last_name: this.fb.control(''),
            email_alternative: this.fb.control(''),
            phone_number: this.fb.control(''),
            company: this.fb.control(''),
            org_number: this.fb.control(''),
            vat_number: this.fb.control(''),
            street_address: this.fb.control(''),
            city: this.fb.control(''),
            postal_code: this.fb.control(''),
            country: this.fb.control(''),
            timezone: this.fb.control(''),
        });
    }

    loadCountryList() {
        const allCountries = ct.getAllCountries();
        for (const country of Object.keys(allCountries)) {
            this.countriesAndTimezones.push(allCountries[country]);
        }
        this.countriesAndTimezones.sort((cA, cB) => {
            if (cA['name'] < cB['name']) {
                return -1;
            }
            if (cA['name'] > cB['name']) {
                return 1;
            }
            return 0;
        });
    }

    loadTimezones() {
        this.rmmapi.getTimezoneList().subscribe((res) =>
            this.timezones = res
        );
    }

    private loadDetails() {
        this.rmmapi.getPersonalDetails().subscribe((res) => {
            this.selectedCountry = res['country'];
            this.selectedTimezone = res['timezone'];
            this.details.next(res as AccountDetailsInterface);
        });
    }

    public update() {
        if (!this.rmm.account_security.user_password) {
            this.show_modal_password();
            return;
        }

        const updates = {};
        for (const name of Object.keys(this.detailsForm.controls)) {
            const ctl = this.detailsForm.get(name);

            // Select fields can't be marked as 'dirty', so it
            // needs a specified case for Countries and Timezones
            if (ctl.dirty) {
                updates[name] = ctl.value;
            } else if (name === 'timezone') {
                updates[name] = this.selectedTimezone;
            } else if (name === 'country' && this.selectedCountry.length > 0) {
                updates[name] = this.selectedCountry;
            }
        }
        updates['password'] = this.rmm.account_security.user_password;

        this.rmmapi.setPersonalDetails(updates)
            .subscribe(
                (res: any) => {
                    if (res['status'] === 'error') {
                        this.field_errors = res['field_errors'];
                        this.rmm.show_error('Account details update failed', 'Dismiss');
                    } else {
                        this.rmm.show_error('Account details updated', 'Dismiss');
                        this.details.next(res as AccountDetailsInterface);
                        this.rmmapi.loadMe();
                    }
            },
                err => console.log('Error saving personal details')
            );


    }

    show_modal_password() {
        this.modal_password_ref = this.dialog.open(ModalPasswordComponent, {
            width: '600px',
            disableClose: true,
            data: { password: null },
        });
        this.modal_password_ref.afterClosed().subscribe((result) => {
            if (result && result['password']) {
                this.rmm.account_security.user_password = result['password'];
            }
        });
    }
}
