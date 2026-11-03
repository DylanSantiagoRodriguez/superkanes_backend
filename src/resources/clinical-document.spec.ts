import { validateClinicalDocument } from './clinical-document';
const document = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});
describe('Documento clínico', () => {
  it('admite documentos extensos con formato', () => {
    expect(validateClinicalDocument(document('a'.repeat(200000)))).toEqual(
      document('a'.repeat(200000)),
    );
    expect(() =>
      validateClinicalDocument({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2, textAlign: 'center' },
            content: [
              { type: 'text', text: 'Historia', marks: [{ type: 'bold' }] },
            ],
          },
        ],
      }),
    ).not.toThrow();
  });
  it('conserva fuente, tamaño, color, resaltado e interlineado acotados', () => {
    const formatted = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { lineHeight: '2' },
          content: [
            {
              type: 'text',
              text: 'Paciente estable',
              marks: [
                {
                  type: 'textStyle',
                  attrs: {
                    fontFamily: 'Georgia',
                    fontSize: '14pt',
                    color: '#245ba6',
                    backgroundColor: '#fff2a8',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    expect(validateClinicalDocument(formatted)).toEqual(formatted);
    for (const attrs of [
      { fontFamily: 'url(https://example.test)' },
      { fontSize: '999pt' },
      { color: 'red;background:url(x)' },
      { backgroundColor: 'url(x)' },
      { onclick: 'alert(1)' },
    ]) {
      expect(() =>
        validateClinicalDocument({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'No',
                  marks: [{ type: 'textStyle', attrs }],
                },
              ],
            },
          ],
        }),
      ).toThrow();
    }
    expect(() =>
      validateClinicalDocument({
        type: 'doc',
        content: [{ type: 'paragraph', attrs: { lineHeight: '999' } }],
      }),
    ).toThrow();
  });
  it('rechaza exceso de texto, URLs, imágenes y atributos arbitrarios', () => {
    expect(() =>
      validateClinicalDocument(document('a'.repeat(200001))),
    ).toThrow();
    for (const node of [
      { type: 'image', attrs: { src: 'javascript:alert(1)' } },
      { type: 'paragraph', attrs: { onclick: 'x' } },
      {
        type: 'text',
        text: 'x',
        marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
      },
    ]) {
      expect(() =>
        validateClinicalDocument({ type: 'doc', content: [node] }),
      ).toThrow();
    }
  });
  it('valida raíz, listas y profundidad', () => {
    expect(() => validateClinicalDocument({ type: 'paragraph' })).toThrow();
    expect(() =>
      validateClinicalDocument({
        type: 'doc',
        content: [
          { type: 'bulletList', content: [{ type: 'text', text: 'x' }] },
        ],
      }),
    ).toThrow();
    let node: unknown = { type: 'paragraph' };
    for (let i = 0; i < 14; i++) node = { type: 'blockquote', content: [node] };
    expect(() =>
      validateClinicalDocument({ type: 'doc', content: [node] }),
    ).toThrow();
  });
});
