const SERVER_URL = "http://localhost:1338";
var OPTIONS = {};


describe('Questionnaire by code', () => {
    before(() => {
        cy.request("POST",SERVER_URL+'/api/functions/get_ui_testing_options',{"questionnaires": 2}).then(res=>OPTIONS=res.body.result)
    });

    it('visit target 1 (no reinvest)',()=>{
        cy.visit(`${OPTIONS.QUESTIONNAIRE_URL}/${OPTIONS.QUESTIONNAIRE_CODES[0]}`);
        cy.waitForReact();
    });

    require("./helpers/questionnaire/noreinvest.js")();

    it('re-visit target 1 (no reinvest)',()=>{
        //cy.wait(3000);
        cy.visit(`${OPTIONS.QUESTIONNAIRE_URL}/${OPTIONS.QUESTIONNAIRE_CODES[0]}`);
        cy.waitForReact();
    }); 

    it("Can't submit twice",()=>{
        cy.get('h1').should('have.text', 'This form has been submitted');
    });

    it('visit target 2 (reinvest)',()=>{
        cy.visit(`${OPTIONS.QUESTIONNAIRE_URL}/${OPTIONS.QUESTIONNAIRE_CODES[1]}`);
        cy.waitForReact();
    });

    require("./helpers/questionnaire/reinvesting.js")();

    //TODO try fill the questionnaire for user who already has account but received new questionnaire - it should says in the end something..

   // it("Should redirect to registration form",()=>{
   //     cy.wait(3);
        /*cy.origin(OPTIONS.FRONT_URL, () => {
            //this will be an error since we can't use experimentalSessionAndOrigin because it requires to reload page every test, so we can only do a visual test here yet..
            cy.location('href').should('eq', `${OPTIONS.FRONT_URL}/auth/register/mbi/${OPTIONS.QUESTIONNAIRE_CODE}`);
        })
        cy.wait(3000);*/
   // });

   /* it("Revisit target 2 - should redirect as well",()=>{
        cy.origin(OPTIONS.FRONT_URL, () => {
            //this will be an error since we can't use experimentalSessionAndOrigin because it requires to reload page every test, so we can only do a visual test here yet..
            cy.location('href').should('eq', `${OPTIONS.FRONT_URL}/auth/register/mbi/${OPTIONS.QUESTIONNAIRE_CODE}`);
        })
        cy.wait(3000);
    }); */

    after(() => {
        cy.wait(3000);
        cy.request("POST",SERVER_URL+'/api/functions/clean_after_ui_testing');
    });
});