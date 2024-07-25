// cypress/e2e/capability_map.cy.js

describe('Capability Map Generation Tests', () => {
  before(() => {
    // Visit the chat page before the tests start
    cy.visit('http://localhost:3000/chat');
    // Ensure localStorage is clear before the tests start
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should generate a capability map and trigger a download event', () => {
    // Input the text to generate capability map
    cy.get('textarea.message-input').type('Generate a new capability map about a car company, it should has 5 levels, each level should have 3 sub levels.');

    // Click the send button
    cy.get('button.send-btn').click();

    // Wait for the p-tree element to appear, timeout set to 60 seconds
    cy.get('.p-tree', { timeout: 60000 }).should('exist').then(() => {
      // Now perform the second part of the test
      // Intercept the download request
      cy.intercept('GET', '/path/to/download', (req) => {
        req.continue((res) => {
          // Validate the response status code
          expect(res.statusCode).to.equal(200);

          // Optionally, validate the response headers and body
          expect(res.headers['content-type']).to.equal('application/octet-stream');
        });
      }).as('downloadRequest');

      // Click the message tool button
      cy.get('button.message-tool-button').click();

      // Wait for the download request to complete
      cy.wait('@downloadRequest');
    });
  });
});
