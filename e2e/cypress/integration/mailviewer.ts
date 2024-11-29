/// <reference types="cypress" />

import { nthMessage } from '../component/message_list.ts'

describe('Interacting with mailviewer', () => {
    function getResizerPercent(): number {
        return parseInt(JSON.parse(localStorage.getItem('221:Desktop:rmm7resizerpercentage') ?? '0'), 10);
    }

    beforeEach(async () => {
        localStorage.setItem('221:localSearchPromptDisplayed', JSON.stringify('true'));
        localStorage.setItem('221:Global:messageSubjectDragTipShown', JSON.stringify('true'));
        localStorage.setItem('221:Desktop:mailViewerOnRightSide', JSON.stringify('true'));
        localStorage.setItem('221:preference_keys', '["Global:messageSubjectDragTipShown", "Desktop:mailViewerOnRightSide"]');

        (await indexedDB.databases())
            .filter(db => db.name && /messageCache/.test(db.name))
            .forEach(db => indexedDB.deleteDatabase(db.name!));
    });

    // it('Loading an email with loading errors displays an error', () => {
    //     cy.intercept('/rest/v1/email/14').as('get14');
    //     cy.visit('/');
    //     cy.wait('@get14', {'timeout':10000});
    //     cy.visit('/#Inbox:14');

    //     cy.get('.support-snackbar').contains('Email content missing');
    // });

    it('can open an email and go back and forth in browser history', () => {
        cy.visit('/#Inbox:11');
        cy.hash().should('equal', '#Inbox:11');
        nthMessage(1).click();
        cy.hash().should('equal', '#Inbox:2');
        cy.go('back');
        cy.hash().should('equal', '#Inbox:11');
        cy.go('forward');
        cy.hash().should('equal', '#Inbox:2');
        cy.get('button[mattooltip="Close"]').click();
        cy.hash().should('equal', '#Inbox');
    });

    it('can reply to an email with no "To"', () => {
        cy.visit('/#Inbox:11')
        cy.get('button[mattooltip="Reply"]').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
        });
        cy.wait(500);
        cy.get('mat-card-actions div').should('contain', 'Re: No \'To\', just \'CC\'');
    });

    it('can forward an email with no "To"', () => {
        cy.visit('/');
        cy.visit('/#Inbox:11');

        cy.get('button[mattooltip="Forward"]').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
        });
        cy.wait(500);
        cy.get('mat-card-actions div').should('contain', 'Fwd: No \'To\', just \'CC\'');
    });

    it('can reply to an email with no "To" or "Subject"', () => {
        cy.visit('/');
        cy.visit('/#Inbox:13');

        cy.get('button[mattooltip="Reply"]').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
        });
        cy.wait(500);
        cy.get('mat-card-actions div').should('contain', 'Re: ');
    });

    it('can forward an email with no "To" or "Subject"', () => {
        cy.visit('/');
        cy.visit('/#Inbox:13');

        cy.get('button[mattooltip="Forward"]').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
        });
        cy.wait(500);
        cy.get('mat-card-actions div').should('contain', 'Fwd: ');
    });

    it('Vertical to horizontal mode exposes full height button', () => {
        cy.visit('/');
        cy.visit('/#Inbox:11');

        // Make sure we're in vertical mode
        cy.get('button[mattooltip="Horizontal preview"]').click();

        cy.get('button[mattooltip="Full height"]').should('exist');        
    });

    it('Changing viewpane height is stored', () => {
        cy.visit('/');
        cy.visit('/#Inbox:11');
        // cy.hash().should('equal', '#Inbox:11');

        // Make sure we're in horizontal mode
        cy.get('button[mattooltip="Horizontal preview"]').click();
        // set full height
        cy.get('button[mattooltip="Full height"]').click().should(() => {
            expect(getResizerPercent()).to.eq(100);
        });
    });

    it('Half height reduces stored pane height', () => {
        cy.visit('/');
        cy.visit('/#Inbox:11');
        // cy.hash().should('equal', '#Inbox:11');

        // Make sure we're in horizontal mode
        cy.get('button[mattooltip="Horizontal preview"]').click();
        // set full height
        let resizerPercent = 0;
        cy.get('button[mattooltip="Full height"]').click().and(() => {
            resizerPercent = getResizerPercent();
        });
        cy.get('button[mattooltip="Half height"]').click().should(() => {
            expect(getResizerPercent()).to.be.eq(50);
            resizerPercent = getResizerPercent();
        });

        cy.get('button[mattooltip="Close"]').click().should(() => {
            expect(getResizerPercent()).to.equal(resizerPercent);
        });
    });

    it('Revisit open email in horizontal mode loads it', () => {
        cy.visit('/');
        cy.visit('/#Inbox:11');
        // cy.hash().should('equal', '#Inbox:11');

        // Switch to horizontal mode
        cy.get('button[mattooltip="Horizontal preview"]').click();

        // revisit
        cy.visit('/#Inbox#11');
        // Half height email pane should still be open
        cy.get('button[mattooltip="Full height"]').should('exist');
    });

    it('Can go out of mailviewer and back and still see our email', () => {
        cy.visit('/');
        cy.visit('/#Inbox:12');
        // cy.hash().should('equal', '#Inbox:12');

        cy.get('div#messageHeaderSubject').contains('Default from fix test');
        cy.get('#composeButton').click();
        cy.go('back');
        cy.get('div#messageHeaderSubject').contains('Default from fix test');
    });

    it('displays avatar bar for emails', () => {
        cy.intercept('/rest/v1/email/download/*').as('getEmail');
        cy.visit('/#Inbox:1');
        cy.wait('@getEmail', { timeout: 10000 });
        cy.get('app-avatar-bar').should('exist');
    });
});
