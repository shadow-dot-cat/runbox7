/// <reference types="cypress" />

describe('Display contact details', () => {
    it('Should display a clickable contact on a list', () => {
        cy.visit('/contacts');
        cy.contains('Welcome to Runbox 7 Contacts');
        cy.contains('Patrick Postcode').click();
        cy.url().should('include', 'id-mr-postcode');
        cy.get('input[placeholder="Company"').should('have.value', 'Post Office #42');
    });
})
