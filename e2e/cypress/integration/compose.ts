/// <reference types="cypress" />

describe('Composing emails', () => {
    function closeWelcomeDialog() {
        cy.get('confirm-dialog').should('contain', 'Welcome to Runbox 7');
        cy.get('confirm-dialog .mat-dialog-actions button:nth-child(3)').click();
    }

    function composeNew() {
        cy.visit('/compose?new=true');
        cy.closeWelcomeDialog();
    }

    it('should display draft card', () => {
        composeNew();
        cy.get('mat-card-actions div').should('contain', 'New message');
        cy.focused().should('have.attr', 'placeholder', 'To');
    });

    it('should update action bar text to subject', () => {
        composeNew();

        cy.get('mat-card-actions div').should('contain', 'New message');
        cy.get('input[placeholder="Subject"]').type('Email about Subject X');
        cy.get('mat-card-actions div').should('contain', 'Subject X');
    });

    it('should complain on invalid email address', () => {
        composeNew();

        cy.get('mailrecipient-input input').type('invalidaddress{enter}');
        cy.get('mailrecipient-input mat-error').should('contain', 'Please enter a valid email address');

        cy.get('mailrecipient-input input').clear().type('test@example.com{enter}');
        cy.get('mailrecipient-input mat-error').should('not.exist');
    });

    it('should open reply draft with HTML editor', () => {
        cy.visit('/');
        cy.closeWelcomeDialog();
        cy.get('canvastable canvas:first-of-type').click({ x: 300, y: 10 });
        cy.get('single-mail-viewer').should('exist');
        cy.get('mat-checkbox[mattooltip="Toggle HTML view"]').click();
        cy.contains('Manually toggle HTML').click();
        cy.get('mat-checkbox[mattooltip="Toggle HTML view"] input').should('be.checked');
        cy.get('button[mattooltip="Reply"]').click();
        // we assume that this is the tinymce frame
        cy.get('iframe').should('exist');
    });

    it('emailing a contact should not use their nickname', () => {
        composeNew();
        cy.get('mailrecipient-input input').clear().type('postpat');
        // autocompletion should show the nickname...
        cy.get('mat-option:contains(Postpat)').click();
        // ...but the resulting contact should not
        cy.get('mat-chip').should('not.contain', 'Postpat');
    });

    it('closing a newly composed email should return where we started', () => {
        cy.visit('/compose');
        composeNew();
        
        cy.get('button[mattooltip="Close draft"').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
            expect(loc.search).to.eq('');
        });
    });

    it('closing a new reply should return to inbox', () => {
        cy.visit('/');
        cy.closeWelcomeDialog();
        cy.get('canvastable canvas:first-of-type').click({ x: 300, y: 10 });
        cy.get('single-mail-viewer').should('exist');
        cy.get('button[mattooltip="Reply"]').click();
        cy.get('button[mattooltip="Close draft"').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/');
            expect(loc.search).to.eq('');
        });
    });

    it('Send email on contacts page, composes an email', () => {
        cy.visit('/contacts');
        cy.contains('Welcome to Runbox 7 Contacts');
        cy.contains('Patrick Postcode').click();
        cy.contains('Send an email to this address').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/compose');
            expect(loc.search).to.eq('?to=patrick@post.no');
        });
        cy.get('mailrecipient-input mat-chip').should('contain', 'patrick@post.no');
    });

    it('closing a new email from contacts list, should return to contacts', () => {
        cy.visit('/contacts');
        cy.contains('Welcome to Runbox 7 Contacts');
        cy.contains('Patrick Postcode').click();
        cy.contains('Send an email to this address').click();
        // NB if we skip checking exist, we get an issue clicking the button
        // not loaded??
        cy.get('button[mattooltip="Close draft"').should('exist');
        cy.get('button[mattooltip="Close draft"').click();
        cy.location().should((loc) => {
            expect(loc.pathname).to.eq('/contacts/id-mr-postcode');
            expect(loc.search).to.eq('');
        }); 
    });
});
