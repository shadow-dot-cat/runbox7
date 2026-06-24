// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2022 Runbox Solutions AS (runbox.com).
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

import { SearchMessageDisplay } from './searchmessagedisplay';
import { MessageFlagChange } from '../rmmapi/rbwebmail';

describe('SearchMessageDisplay flag updates', () => {
    function createMockSearchService() {
        // Map docId -> message ID
        const docIdToMsgId: { [key: number]: number } = { 1: 123, 2: 456 };
        // Per-doc data, all starting unseen/unflagged
        const docDataStore: Record<number, {
            id: string; seen: boolean; flagged: boolean;
            from: string; subject: string;
            recipients: string[]; textcontent: string;
            folder: string; attachment: boolean; answered: boolean;
        }> = {
            1: {
                id: 'Q123', seen: false, flagged: false,
                from: 'sender@test.com', subject: 'First',
                recipients: ['recipient@test.com'], textcontent: 'body 1',
                folder: 'Inbox', attachment: false, answered: false,
            },
            2: {
                id: 'Q456', seen: false, flagged: false,
                from: 'sender2@test.com', subject: 'Second',
                recipients: ['recipient@test.com'], textcontent: 'body 2',
                folder: 'Inbox', attachment: false, answered: false,
            },
        };

        return {
            getDocData: (docId: number) => docDataStore[docId],
            getMessageIdFromDocId: (docId: number) => docIdToMsgId[docId] || 0,
            api: {
                getStringValue: () => '20190223123322',
                getNumericValue: () => 709,
            },
            messageText: () => null,
        };
    }

    function createDisplay() {
        const svc = createMockSearchService();
        // Rows are [docId, sortValue] tuples
        const display = new SearchMessageDisplay(svc, [[1, 0], [2, 0]]);
        display.renderedRange = { start: 0, end: 2 };
        return display;
    }

    it('enriches rows with seen=false initially', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        expect(display.rows[0].display.seen).toBe(false);
        expect(display.rows[1].display.seen).toBe(false);
    });

    it('updates display.seen when applyFlagChange sets seenFlag=true', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        expect(display.rows[0].display.seen).toBe(false);

        const result = display.applyFlagChange(
            new MessageFlagChange(123, true, null)
        );

        expect(result).toBe(true);
        expect(display.rows[0].display.seen).toBe(true);
    });

    it('updates display.seen back to false when applyFlagChange sets seenFlag=false', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);
        display.applyFlagChange(new MessageFlagChange(123, true, null));

        expect(display.rows[0].display.seen).toBe(true);

        display.applyFlagChange(new MessageFlagChange(123, false, null));

        expect(display.rows[0].display.seen).toBe(false);
    });

    it('updates display.flagged when applyFlagChange sets flaggedFlag', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        expect(display.rows[0].display.flagged).toBe(false);

        display.applyFlagChange(new MessageFlagChange(123, null, true));

        expect(display.rows[0].display.flagged).toBe(true);
    });

    it('only updates the matching row, not others', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        display.applyFlagChange(new MessageFlagChange(123, true, null));

        expect(display.rows[0].display.seen).toBe(true);
        expect(display.rows[1].display.seen).toBe(false);
    });

    it('returns false when message ID is not in the display', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        const result = display.applyFlagChange(
            new MessageFlagChange(999, true, null)
        );

        expect(result).toBe(false);
    });

    it('returns false when rows have not been enriched yet', () => {
        const display = createDisplay();
        // No enrichRows call - display objects not set

        const result = display.applyFlagChange(
            new MessageFlagChange(123, true, null)
        );

        expect(result).toBe(false);
    });

    it('updates display.flagged back to false when applyFlagChange sets flaggedFlag=false', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);
        display.applyFlagChange(new MessageFlagChange(123, null, true));

        expect(display.rows[0].display.flagged).toBe(true);

        display.applyFlagChange(new MessageFlagChange(123, null, false));

        expect(display.rows[0].display.flagged).toBe(false);
    });

    it('preserves flag change after enrichRows re-runs (e.g. from scroll)', async () => {
        const display = createDisplay();
        await display.enrichRows(() => undefined);

        display.applyFlagChange(new MessageFlagChange(123, true, null));
        expect(display.rows[0].display.seen).toBe(true);

        // Simulate scroll-triggered re-enrichment
        await display.enrichRows(() => undefined);

        expect(display.rows[0].display.seen).toBe(true);
    });
});
