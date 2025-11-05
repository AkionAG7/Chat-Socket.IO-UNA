// libs/risk-core.js
function computeScore(p, i) {
  const P = Number(p);
  const I = Number(i);
  if (!Number.isInteger(P) || !Number.isInteger(I)) {
    throw new Error('invalid_integer');
  }
  if (P < 1 || P > 5 || I < 1 || I > 5) {
    throw new RangeError('out_of_range');
  }
  return P * I;
}

function levelFor(score) {
  if (score <= 4)  return 'low';
  if (score <= 9)  return 'medium';
  if (score <= 16) return 'high';
  return 'critical';
}

function textFor(score) {
  if (score <= 4)  return 'Bajo';
  if (score <= 9)  return 'Medio';
  if (score <= 16) return 'Alto';
  return 'Crítico';
}

function advice(level) {
  if (level === 'low')      return 'Riesgo aceptable con controles existentes.';
  if (level === 'medium')   return 'Monitoreo frecuente y refuerzo de controles si es necesario.';
  if (level === 'high')     return 'Atención prioritaria y controles adicionales inmediatos.';
  return 'Riesgo inaceptable: acción y mitigación inmediata obligatoria.';
}

module.exports = { computeScore, levelFor, textFor, advice };
