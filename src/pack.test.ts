import { pack } from './index';

jest.setTimeout(720_000);

test('Pack with single and multiple sourcedirs', async () => {
    const result = await pack({
        baseDir: './tests/in/pack-01',
        outDir: './tests/out/pack-01',
        modules: [{
            name: 'a',
            sourceDir: './a',
        }, {
            name: 'b',
            sourceDir: './b',
        }, {
            name: 'c',
            sourceDir: './c',
        }, {
            name: 'def',
            sourceDir: ['./d', './e', './f'],
        }],
    });

    expect(result.fullHash).toBeDefined();
    expect(result.base.hash).toBeDefined();
    expect(result.base.files).toContain('a.json');
    expect(result.base.files).toContain('module.json');
    expect(result.modules).toHaveLength(4);
    
    // Find the multi-source module
    const defModule = result.modules.find(m => m.name === 'def');
    expect(defModule).toBeDefined();
    expect(Array.isArray(defModule.sourceDir)).toBe(true);
    expect(defModule.sourceDir).toEqual(['./d', './e', './f']);
});
