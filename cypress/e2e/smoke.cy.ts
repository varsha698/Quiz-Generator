describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.get('h1').should('contain', 'QuizMaster');
    cy.get('body').should('be.visible');
  });

  it('should navigate to quiz generator', () => {
    cy.get('a[href="/quiz-generator"]').click();
    cy.url().should('include', '/quiz-generator');
    cy.get('h1').should('contain', 'Quiz Generator');
  });

  it('should navigate to take quiz', () => {
    cy.get('a[href="/take-quiz"]').click();
    cy.url().should('include', '/take-quiz');
    cy.get('h1').should('contain', 'Take Quiz');
  });

  it('should navigate to leaderboard', () => {
    cy.get('a[href="/leaderboard"]').click();
    cy.url().should('include', '/leaderboard');
    cy.get('h1').should('contain', 'Your Stats');
  });

  it('should have working navigation', () => {
    cy.get('nav').should('be.visible');
    cy.get('nav a').should('have.length.at.least', 3);
  });

  it('should be responsive', () => {
    cy.viewport(375, 667); // Mobile
    cy.get('body').should('be.visible');
    
    cy.viewport(768, 1024); // Tablet
    cy.get('body').should('be.visible');
    
    cy.viewport(1920, 1080); // Desktop
    cy.get('body').should('be.visible');
  });
});
