const { expect } = require('chai');
const { computeScore, levelFor, textFor } = require('../libs/risk-core');

describe('Calculadora de riesgos · núcleo (sin DOM)', () => {

  it('calcula el score válido (p × i)', () => {
    expect(computeScore(1, 1)).to.equal(1);
    expect(computeScore(3, 4)).to.equal(12);
    expect(computeScore(5, 5)).to.equal(25);
  });

  it('lanza error si no son enteros', () => {
    expect(() => computeScore('a', 2)).to.throw('invalid_integer');
    expect(() => computeScore(2.3, 2)).to.throw('invalid_integer');
  });

  it('lanza error si están fuera de 1..5', () => {
    expect(() => computeScore(0, 3)).to.throw('out_of_range');
    expect(() => computeScore(6, 1)).to.throw('out_of_range');
    expect(() => computeScore(3, 0)).to.throw('out_of_range');
  });

  it('mapea niveles correctos por score', () => {
    expect(levelFor(1)).to.equal('low');
    expect(levelFor(4)).to.equal('low');
    expect(levelFor(5)).to.equal('medium');
    expect(levelFor(9)).to.equal('medium');
    expect(levelFor(10)).to.equal('high');
    expect(levelFor(16)).to.equal('high');
    expect(levelFor(17)).to.equal('critical');
    expect(levelFor(25)).to.equal('critical');
  });

  it('devuelve el texto correcto por score', () => {
    expect(textFor(3)).to.equal('Bajo');
    expect(textFor(8)).to.equal('Medio');
    expect(textFor(15)).to.equal('Alto');
    expect(textFor(22)).to.equal('Crítico');
  });

});
