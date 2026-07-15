// tests/core/engine.test.ts
import { describe, it, expect } from 'vitest';
import { OptiQueryEngine } from '../../src/core/engine.js';
import { noSelectStarRule } from '../../src/plugins/sql/no-select-star.js';

describe('Core: OptiQueryEngine (Exclusion System)', () => {
  it('should ignore an issue if // optiquery-disable-next-line is present', () => {
    const engine = new OptiQueryEngine();
    engine.registerRules([noSelectStarRule]); 

    const code = `
      // optiquery-disable-next-line
      const query = db.query("SELECT * FROM users");
    `;

    const issues = engine.analyzeCode(code, 'test.ts');
    
    expect(issues).toHaveLength(0); 
  });

  it('should report the issue normally if the comment is missing', () => {
    const engine = new OptiQueryEngine();
    engine.registerRules([noSelectStarRule]);

    const code = `
      const query = db.query("SELECT * FROM users");
    `;

    const issues = engine.analyzeCode(code, 'test.ts');
    
    expect(issues).toHaveLength(1); 
  });
});