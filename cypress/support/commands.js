Cypress.Commands.add('findFirst', (selectors) => {
  const arr = Array.isArray(selectors) ? selectors : [selectors];
  function tryNext(i) {
    if (i >= arr.length) throw new Error(`Ningún selector coincidió: ${arr.join(', ')}`);
    const sel = arr[i];
    return cy.document().then((doc) => {
      const el = doc.querySelector(sel);
      if (el) return cy.get(sel);
      return tryNext(i + 1);
    });
  }
  return tryNext(0);
});
