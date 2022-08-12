const URL='http://localhost:3000'
const lender_id="rJwMYHFUts"

describe('Not reinvesting user using lender link', () => {
    before(() => {
      cy.visit(URL+"/l/"+lender_id);
      cy.waitForReact();
      //cy.waitForReact(5000, '#root');
    })


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
        cy.get('#next_btn').should('have.text', 'SUBMIT');

        //choosing property_sale
        cy.get('[value="PROPERTY_SALE"]').click();
        cy.get('input[name="reinvesting"]').should('exist');
        cy.get('#next_btn').should('have.text', 'NEXT');

        //choosing not to reinvest
        cy.get('input[name="reinvesting"]').click();
        cy.get('#next_btn').should('have.text', 'SUBMIT');

        cy.get('#next_btn').click();
        cy.get('h1').should('have.text','Thank you');
        //cy.get('input').should('have.length', '1');
       // cy.get('.MuiBox-root').first().should('have.length', '1');
        //cy.react('Dialog').should('have.length', '1');
        //cy.react('StaticDatePickerField').should('have.length', '1');

        // We use the `cy.get()` command to get all elements that match the selector.
        // Then, we use `should` to assert that there are two matched items,
        // which are the two default items.
        //cy.get('.todo-list li').should('have.length', 2)
    
        // We can go even further and check that the default todos each contain
        // the correct text. We use the `first` and `last` functions
        // to get just the first and last matched elements individually,
        // and then perform an assertion with `should`.
        //cy.get('.todo-list li').first().should('have.text', 'Pay electric bill')
        //cy.get('.todo-list li').last().should('have.text', 'Walk the dog')
    })
});