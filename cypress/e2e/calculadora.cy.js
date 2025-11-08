describe('Calculadora de riesgos - Flujo completo', () => {
  const goToCalculadora = () => {
    cy.visit('/');
    cy.contains(/Calculadora de Riesgo/i).click({ force: true });
  };

  beforeEach(() => {
    goToCalculadora();
  });

  it('Nombre + Prob + Impacto -> Calcular -> Guardar -> Limpiar (en ese orden)', () => {
    cy.get('#btnGuardar').should('be.disabled');    const nombre = `Prueba E2E`;
    cy.get('#nombre').clear().type(nombre);
    cy.get('#probabilidad').clear().type('3');
    cy.get('#impacto').clear().type('4');

    cy.get('#btnCalcular').click();

    cy.get('#btnGuardar').should('not.be.disabled');

    cy.get('#score').invoke('text').then(t => {
      expect(t.trim()).to.equal('12');
    });
    cy.get('#badge').invoke('text').should('match', /Bajo|Medio|Alto|Crítico/i);

    cy.get('#btnGuardar').click();

    cy.get('#lista .item, #lista li, #lista .row')
      .should('have.length.greaterThan', 0)
      .first()
      .invoke('text')
      .should('include', nombre);

    cy.get('#btnLimpiar').click();

    cy.get('#nombre').should('have.value', '');
    cy.get('#probabilidad').should('have.value', '');
    cy.get('#impacto').should('have.value', '');
    cy.get('#btnGuardar').should('be.disabled');

    cy.get('#score').invoke('text').then(t => expect(t.trim()).to.be.oneOf(['', '—']));
    cy.get('#mensaje').invoke('text').then(t => expect(t.trim()).to.match(/^$|^Ingrese|^Complete/i));
  });
});
