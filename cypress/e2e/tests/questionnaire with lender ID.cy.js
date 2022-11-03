const SERVER_URL = "http://localhost:1338";
var OPTIONS = {EMAILS:[]};

describe('Questionnaire by lender ID', () => {
    before(() => {
        cy.request("POST",SERVER_URL+'/api/functions/get_ui_testing_options').then(res=> OPTIONS=res.body.result)
    });

    it('visit target 1 (no reinvest)',()=>{
        cy.visit(`${OPTIONS.QUESTIONNAIRE_URL}/l/${OPTIONS.LENDER_ID}`);
        cy.waitForReact();
    });

    //NO REINVEST    
    it('first page', () => {
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
    
        //choosing property_sale
        cy.get('[value="PROPERTY_SALE"]').click();
        cy.get('input[name="reinvesting"]').should('exist');
        cy.get('#next_btn').should('have.text', 'NEXT');
    
        //choosing not to reinvest
        cy.get('input[name="reinvesting"]').click();    
        cy.get('#next_btn').click();

    })
    it('second page', () => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Contact information');
        //cy.get('#next_btn').should('be.disabled');
        cy.get('input').should('have.length', '5');
        cy.get('#\\:r3\\:').type("John");
        cy.get('#\\:r5\\:').type("Doe");
        cy.get('#\\:r7\\:').type(OPTIONS.EMAILS[0]);
        cy.get('#\\:r9\\:').type("0000000000");
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').should('have.text', 'SUBMIT');
        cy.get('#next_btn').click();
    });
    it('third page', () => {
        cy.get('h1').should('have.text', 'Thank you');
    });

    //REINVEST    
    it('visit target 2 (reinvest)',()=>{
        cy.visit(`${OPTIONS.QUESTIONNAIRE_URL}/l/${OPTIONS.LENDER_ID}`);
        cy.waitForReact();
    });
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

    it('second page', () => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Reinvestment Preference');
        cy.get('#next_btn').should('be.disabled');
        //choosing direct ownership
        cy.get('[value="DIRECT_OWNERSHIP"]').click();

        //choosing multifamily
        cy.get('.MuiGrid-container > :nth-child(1) > .MuiButtonBase-root').click();
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('third page', () => {
        cy.wait(1000);
        cy.get('.MuiTypography-h4').should('have.text', 'Location Preference');
        //cy.get('#next_btn').should('be.disabled');
        //choosing LA
        cy.get('input').type('Los Ange');
        cy.get('.MuiAutocomplete-popper').should('exist');
        cy.get('.MuiAutocomplete-popper li[data-option-index="2"]').click();
        //choosing Ventura county
        cy.wait(1000);
        cy.get('input').should('have.length', '1');
        cy.get('input').type('Ventura');
        cy.get('.MuiAutocomplete-popper').should('exist');
        cy.get('.MuiAutocomplete-popper li[data-option-index="2"]').click();
        cy.get('.MuiChip-label').should('have.length', '2');
        //TODO - choose country on map - how?
        cy.wait(1000);
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('fourth page', () => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Property Value and Equity');
        //cy.get('#next_btn').should('be.disabled');
        cy.get('input').should('have.length', '3');
        cy.get('input').first().type('1000000');
        cy.get('#\\:rb\\:').type('3000000');
        //cy.get('input').first().next().type('3000000');
        cy.get('input').last().type('1000000');
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });

    it('fifth page', () => {
        cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Contact information');
        //cy.get('#next_btn').should('be.disabled');
        cy.get('input').should('have.length', '5');
        cy.get('#\\:rf\\:').type("John");
        cy.get('#\\:rh\\:').type("Doe");
        cy.get('#\\:rj\\:').type(OPTIONS.EMAILS[1]);
        cy.get('#\\:rl\\:').type("0000000000");
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').click();
    });
    it('sixth page', () => {
        //cy.get('.MuiBox-root > .MuiTypography-root').should('have.text', 'Contact information');
        cy.get('#next_btn').should('not.be.disabled');
        cy.get('#next_btn').should('have.text', 'SUBMIT');
        cy.get('#next_btn').click();
    });

    after(() => {
        cy.wait(3000);
        cy.request("POST",SERVER_URL+'/api/functions/clean_after_ui_testing');
    });
});