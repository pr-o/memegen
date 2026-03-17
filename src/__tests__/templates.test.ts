import { templates } from '@/data/templates';

describe('templates data', () => {
  it('has at least one template', () => {
    expect(templates.length).toBeGreaterThan(0);
  });

  it('every template has required fields', () => {
    for (const t of templates) {
      expect(typeof t.id).toBe('string');
      expect(typeof t.name).toBe('string');
      expect(typeof t.src).toBe('string');
      expect(typeof t.width).toBe('number');
      expect(typeof t.height).toBe('number');
      expect(Array.isArray(t.textLayers)).toBe(true);
    }
  });

  it('every template has a unique id', () => {
    const ids = templates.map((t) => t.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('text layer positions are within reasonable bounds', () => {
    for (const t of templates) {
      for (const layer of t.textLayers) {
        // Allow slight overhang outside canvas (e.g. -0.05 for intentional bleed)
        expect(layer.x).toBeGreaterThanOrEqual(-0.1);
        expect(layer.x).toBeLessThanOrEqual(1);
        expect(layer.y).toBeGreaterThanOrEqual(-0.1);
        expect(layer.y).toBeLessThanOrEqual(1);
        expect(layer.w).toBeGreaterThan(0);
        expect(layer.w).toBeLessThanOrEqual(1);
        expect(layer.h).toBeGreaterThan(0);
        expect(layer.h).toBeLessThanOrEqual(1);
      }
    }
  });
});
