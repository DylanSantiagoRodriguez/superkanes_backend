import { PDFDocument } from 'pdf-lib';
import {
  clinicalFileType,
  clinicalPdf,
  documentText,
} from './clinical-document-files';
describe('Archivos clínicos', () => {
  it('genera PDF paginado y valida su estructura', async () => {
    const pdf = await clinicalPdf('Historia clínica', [
      'Paciente: Luna',
      'Unidad registrada: μg',
      ...Array.from({ length: 150 }, (_, i) => `Hallazgo ${i}`),
    ]);
    expect(await clinicalFileType(pdf)).toBe('application/pdf');
    expect((await PDFDocument.load(pdf)).getPageCount()).toBeGreaterThan(1);
  });
  it('rechaza PDF falso y JavaScript embebido', async () => {
    await expect(
      clinicalFileType(Buffer.from('%PDF-1.7 mentira')),
    ).rejects.toThrow();
    const pdf = await PDFDocument.create();
    pdf.addPage();
    pdf.addJavaScript('active', 'app.alert(1)');
    await expect(
      clinicalFileType(Buffer.from(await pdf.save())),
    ).rejects.toThrow();
  });
  it('conserva el texto de las notas sin ejecutar ni interpretar marcas', () => {
    expect(
      documentText({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Nota clínica' }],
          },
        ],
      }),
    ).toBe('Nota clínica\n');
  });
});
