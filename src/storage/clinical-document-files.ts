import { BadRequestException } from '@nestjs/common';
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFStream,
  rgb,
} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function clinicalFileType(buffer: Buffer): Promise<string> {
  if (!buffer.length || buffer.length > 10 * 1024 * 1024)
    throw new BadRequestException('Archivo de hasta 10 MB');
  if (buffer.subarray(0, 5).toString() === '%PDF-') {
    try {
      const document = await PDFDocument.load(buffer, {
        ignoreEncryption: false,
        updateMetadata: false,
        throwOnInvalidObject: true,
      });
      if (
        document.isEncrypted ||
        document.getPageCount() < 1 ||
        document.getPageCount() > 500
      )
        throw new Error('pages');
      const forbidden = new Set([
        'JS',
        'JavaScript',
        'AA',
        'OpenAction',
        'EmbeddedFiles',
        'EmbeddedFile',
        'RichMedia',
        'XFA',
        'Launch',
        'SubmitForm',
        'ImportData',
      ]);
      const seen = new Set<PDFObject>();
      const inspect = (value: PDFObject, depth = 0) => {
        if (seen.has(value)) return;
        seen.add(value);
        if (depth > 60 || seen.size > 100000) throw new Error('complexity');
        if (value instanceof PDFName && forbidden.has(value.decodeText()))
          throw new Error('active');
        if (value instanceof PDFStream) inspect(value.dict, depth + 1);
        if (value instanceof PDFDict)
          for (const [key, item] of value.entries()) {
            if (forbidden.has(key.decodeText())) throw new Error('active');
            inspect(item, depth + 1);
          }
        if (value instanceof PDFArray)
          for (const item of value.asArray()) inspect(item, depth + 1);
      };
      for (const [, value] of document.context.enumerateIndirectObjects())
        inspect(value);
      return 'application/pdf';
    } catch {
      throw new BadRequestException(
        'PDF invalido, cifrado, demasiado extenso o con contenido activo',
      );
    }
  }
  try {
    const picture = sharp(buffer, {
      limitInputPixels: 40000000,
      failOn: 'warning',
    });
    const metadata = await picture.metadata();
    const types: Record<string, string> = {
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const mime = types[metadata.format ?? ''];
    if (!mime || (metadata.pages ?? 1) !== 1) throw new Error('format');
    await picture.stats(); // Decode the full image; preserve original diagnostic bytes.
    return mime;
  } catch {
    throw new BadRequestException(
      'Adjunta un PDF o una imagen JPEG, PNG o WebP valida',
    );
  }
}
export function documentText(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const node = value as { text?: unknown; content?: unknown; type?: unknown };
  if (typeof node.text === 'string') return node.text;
  const children = Array.isArray(node.content)
    ? node.content.map(documentText).join('')
    : '';
  return (
    children +
    (['paragraph', 'heading', 'listItem', 'hardBreak'].includes(
      String(node.type),
    )
      ? '\n'
      : '')
  );
}
export async function clinicalPdf(
  title: string,
  lines: string[],
): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(
    await readFile(join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf')),
    { subset: true },
  );
  pdf.setTitle(title);
  pdf.setCreator('SUPERKANES');
  pdf.setProducer('SUPERKANES');
  let page = pdf.addPage([595.28, 841.89]),
    y = 790;
  const supported = new Set(font.getCharacterSet());
  const write = (text: string, size = 10) => {
    const clean = text.replace(/\t/g, '    ').replace(/\r/g, '');
    if (
      Array.from(clean).some(
        (char) => char !== '\n' && !supported.has(char.codePointAt(0)!),
      )
    )
      throw new BadRequestException(
        'El documento contiene caracteres sin soporte en la fuente PDF',
      );
    for (const paragraph of clean.split('\n')) {
      let line = '';
      for (const char of paragraph) {
        if (font.widthOfTextAtSize(line + char, size) > 495 && line) {
          render(line, size);
          line = '';
        }
        line += char;
      }
      render(line, size);
    }
  };
  const render = (line: string, size: number) => {
    if (y < 65) {
      page = pdf.addPage([595.28, 841.89]);
      y = 790;
    }
    page.drawText(line, { x: 50, y, size, font, color: rgb(0.12, 0.18, 0.15) });
    y -= size * 1.5;
  };
  write(title, 18);
  y -= 12;
  for (const line of lines) {
    write(line);
    y -= 5;
  }
  pdf.getPages().forEach((p, index) =>
    p.drawText(`SUPERKANES · ${index + 1} / ${pdf.getPageCount()}`, {
      x: 50,
      y: 30,
      size: 8,
      font,
    }),
  );
  return Buffer.from(await pdf.save());
}
