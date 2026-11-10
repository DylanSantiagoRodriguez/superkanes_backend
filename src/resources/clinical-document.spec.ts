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

describe('Formato pegado desde navegador', () => {
  it('normaliza RGB, estilos vacíos y unidades CSS sin cambiar el texto', () => {
    const value = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { lineHeight: '' },
          content: [
            {
              type: 'text',
              text: 'Texto pegado',
              marks: [
                {
                  type: 'textStyle',
                  attrs: {
                    color: 'rgb(36, 91, 166)',
                    backgroundColor: '',
                    fontFamily: '"Times New Roman"',
                    fontSize: '16px',
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const result = validateClinicalDocument(value) as typeof value;
    expect(result.content[0].content[0].marks[0].attrs).toEqual({
      color: '#245ba6',
      backgroundColor: null,
      fontFamily: 'Times New Roman',
      fontSize: '12pt',
    });
    expect(result.content[0].content[0].text).toBe('Texto pegado');
    expect(value.content[0].content[0].marks[0].attrs.color).toBe(
      'rgb(36, 91, 166)',
    );
  });
  it('mantiene el rechazo de colores fuera de rango y CSS activo', () => {
    for (const color of [
      'rgb(999,0,0)',
      'rgb(1,2,3);background:url(x)',
      'url(javascript:x)',
      'rgba(1,2,3,0.5)',
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
                  marks: [{ type: 'textStyle', attrs: { color } }],
                },
              ],
            },
          ],
        }),
      ).toThrow();
    }
  });
});
