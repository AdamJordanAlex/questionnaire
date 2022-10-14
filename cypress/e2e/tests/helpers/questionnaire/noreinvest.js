
module.exports = function (MBI_EMAIL) {

  it('displays datepicker', () => {
    cy.get('#next_btn').should('have.text', 'NEXT');
    cy.get('.MuiCalendarPicker-root').should('have.length', '1');
    cy.get('div[name="payoff_reason_group"]').should('not.exist');
    cy.get('input[name="reinvesting"]').should('not.exist');

    //choosing last day of current month
    cy.get('.MuiCalendarPicker-root button').last().click();
    cy.get('div[name="payoff_reason_group"]').should('exist');

    //choosing refinance
    cy.get('[value="REFINANCE"]').click();
    cy.get('input[name="reinvesting"]').should('not.exist');
    if (MBI_EMAIL)
      cy.get('#next_btn').should('have.text', 'NEXT');
    else
      cy.get('#next_btn').should('have.text', 'SUBMIT');

    //choosing property_sale
    cy.get('[value="PROPERTY_SALE"]').click();
    cy.get('input[name="reinvesting"]').should('exist');
    cy.get('#next_btn').should('have.text', 'NEXT');

    //choosing not to reinvest
    cy.get('input[name="reinvesting"]').click();
    cy.get('#next_btn').should('have.text', 'SUBMIT');

    cy.get('#next_btn').click();
    cy.get('h1').should('have.text', 'Thank you');

  })
}