const URL='http://localhost:3000';
const LENDER_ID="rJwMYHFUts";
const QUESTIONNAIRE_ID="96a30cb0-3dcb-4eb5-82a1-2a82e374dedc";
const EMAIL='johndoe@notexistedgmail.com';

describe('Full questionnaire flow by lender link', () => {
    before(() => {
      //cy.visit(URL+"/l/"+LENDER_ID);
      cy.visit(URL+"/"+QUESTIONNAIRE_ID);
      cy.waitForReact();
      //cy.waitForReact(5000, '#root');
    })

    it('first page', () => {
        cy.get('#next_btn').should('be.disabled');
        //choosing last day of current month
        cy.get('.MuiCalendarPicker-root button').last().click();
        cy.get('div[name="payoff_reason_group"]').should('exist');

        //choosing property_sale
        cy.get('[value="PROPERTY_SALE"]').click();
        cy.get('input[name="reinvesting"]').should('exist');
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('second page',() => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Reinvestment Preference');
        cy.get('#next_btn').should('be.disabled');
        //choosing direct ownership
        cy.get('[value="DIRECT_OWNERSHIP"]').click();

        //choosing multifamily
        cy.get('.MuiGrid-container > :nth-child(1) > .MuiButtonBase-root').click();
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('third page',() => {
        cy.wait(1000);
        cy.get('.MuiTypography-h4').should('have.text', 'Location Preference');
        //cy.get('#next_btn').should('be.disabled');
        //choosing LA
        cy.get('input').type('Los Ange');
        cy.get('.MuiAutocomplete-popper').should('exist');
        cy.get('.MuiAutocomplete-popper li[data-option-index="0"]').click();
        //choosing Ventura county
        cy.wait(1000);
        cy.get('input').should('have.length', '1');
        cy.get('input').type('Ventura');
        cy.get('.MuiAutocomplete-popper').should('exist');
        cy.get('.MuiAutocomplete-popper li[data-option-index="0"]').click();
        cy.get('.MuiChip-label').should('have.length', '2');
        //TODO - choose country on map - how?
        cy.wait(1000);
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('fourth page',() => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Property Value and Equity');
        //cy.get('#next_btn').should('be.disabled');
        cy.get('input').should('have.length', '3');
        cy.get('input').first().type('1000000');
        cy.get('#\\:r9\\:').type('3000000');
        //cy.get('input').first().next().type('3000000');
        cy.get('input').last().type('1000000');
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('fifth page',()=>{
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Contact information');
        //cy.get('#next_btn').should('be.disabled');
        cy.get('input').should('have.length', '5');
        //cy.get('#\\:rd\\:').type("John");
        //cy.get('#\\:rf\\:').type("Doe");
        //cy.get('#\\:rh\\:').type(EMAIL);
        cy.get('#\\:rj\\:').type("0000000000");
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });
    it('sixth page',()=>{
        //cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Contact information');
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').should('have.text', 'SUBMIT');

    });
});