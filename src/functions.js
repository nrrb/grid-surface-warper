// Mathematical function definitions for surface warping
export const functionDefinitions = {
  'sineRidge': {
    name: 'Sine Ridge',
    key: 'sineRidge',
    func: (x, y, params) => Math.sin(params.a * x) * Math.cos(params.b * y),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'ripple': {
    name: 'Radial Ripple',
    key: 'ripple',
    func: (x, y, params) => {
      const r = Math.sqrt(params.a * params.a * x * x + params.b * params.b * y * y);
      return Math.sin(r) / (1 + Math.sqrt(x * x + y * y));
    },
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'organicHill': {
    name: 'Organic Hill',
    key: 'organicHill',
    func: (x, y) => Math.sin(x) * Math.sin(y) + 0.5 * Math.sin(2 * x) * Math.cos(2 * y)
  },
  'eggCrate': {
    name: 'Egg Crate',
    key: 'eggCrate',
    func: (x, y, params) => Math.pow(Math.sin(params.a * x), 2) + Math.pow(Math.cos(params.b * y), 2),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'brainFolds': {
    name: 'Brain Folds',
    key: 'brainFolds',
    func: (x, y, params) => 
      Math.sin(params.a * x + Math.sin(params.b * y)) + 
      Math.cos(params.b * y + Math.cos(params.a * x)),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'caustic': {
    name: 'Cellular Caustic',
    key: 'caustic',
    func: (x, y) => Math.sin(x * x + y * y) / (1 + 0.1 * x * x + 0.1 * y * y)
  },
  'foldedLeaf': {
    name: 'Folded Leaf',
    key: 'foldedLeaf',
    func: (x, y) => Math.sin(x) * Math.cos(y) + 0.3 * Math.sin(3 * x + y)
  },
  'turbulentPlasma': {
    name: 'Turbulent Plasma',
    key: 'turbulentPlasma',
    func: (x, y, params) => 
      Math.sin(params.a * x + Math.sin(params.b * y)) * 
      Math.cos(params.b * y + Math.sin(params.a * x)),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'noisyOrganism': {
    name: 'Noisy Organism',
    key: 'noisyOrganism',
    func: (x, y) => Math.sin(x) + Math.cos(y) + 0.1 * (Math.random() * 2 - 1)
  },
  'craterField': {
    name: 'Crater Field',
    key: 'craterField',
    func: (x, y) => Math.sin(x * x - y * y) / (1 + 0.5 * x * x + 0.5 * y * y)
  },
  'reflectiveShell': {
    name: 'Reflective Shell',
    key: 'reflectiveShell',
    func: (x, y, params) => 
      Math.tanh(Math.sin(params.a * x) + Math.cos(params.b * y)),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'bioMesh': {
    name: 'Biological Mesh',
    key: 'bioMesh',
    func: (x, y) => Math.cos(x + Math.sin(y)) * Math.sin(y + Math.cos(x))
  },
  'bamboo': {
    name: 'Bamboo Nodes',
    key: 'bamboo',
    func: (x, y, params) => Math.sin(params.a * x) / (1 + Math.cos(params.b * y)),
    params: {
      a: { value: 3, min: 0.1, max: 10, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'sineNet': {
    name: 'Psychedelic Sine Net',
    key: 'sineNet',
    func: (x, y) => Math.sin(x) * Math.cos(y) + Math.sin(3 * x) * Math.cos(3 * y)
  },
  'biowave': {
    name: 'Biowave Braids',
    key: 'biowave',
    func: (x, y, params) => 
      Math.sin(params.a * x + Math.sin(params.b * y)) + 
      Math.cos(params.a * y + Math.cos(params.b * x)),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.01, label: 'B' }
    }
  },
  'tunnel': {
    name: 'Peristaltic Tunnel',
    key: 'tunnel',
    func: (x, y) => Math.sin(x) * Math.sin(y) * Math.cos(x + y)
  },
  'organicWeb': {
    name: 'Organic Webbing',
    key: 'organicWeb',
    func: (x, y, params) => 
      Math.sin(params.a * x * x + params.b * y * y) * 
      Math.cos(params.c * x * y),
    params: {
      a: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: 'A' },
      b: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: 'B' },
      c: { value: 0.1, min: 0.01, max: 1, step: 0.01, label: 'C' }
    }
  },
  'vortexWrap': {
    name: 'Vortex Wrap',
    key: 'vortexWrap',
    func: (x, y) => Math.atan2(y, x) + Math.sin(Math.sqrt(x * x + y * y))
  },
  'nestedWaves': {
    name: 'Nested Waves',
    key: 'nestedWaves',
    func: (x, y, params) => 
      Math.sin(params.a * x + Math.sin(params.b * y + Math.sin(params.c * x))),
    params: {
      a: { value: 1, min: 0.1, max: 5, step: 0.1, label: 'A' },
      b: { value: 1, min: 0.1, max: 5, step: 0.1, label: 'B' },
      c: { value: 1, min: 0.1, max: 5, step: 0.1, label: 'C' }
    }
  },
  wiggler: {
    name: 'Wiggling Surface',
    key: 'wiggler',
    func: (x, y) => Math.sin(x) * Math.tanh(y) + Math.cos(x + y)
  }
};
