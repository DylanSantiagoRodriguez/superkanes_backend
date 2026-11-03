import sharp from 'sharp';
import { normalizePhoto } from './storage.service';
describe('Fotos de paciente', () => {
  it('decodifica y normaliza imágenes reales a WebP sin metadatos', async () => {
    const input = await sharp({
      create: { width: 3000, height: 30, channels: 3, background: 'red' },
    })
      .jpeg()
      .toBuffer();
    const output = await normalizePhoto(input);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBe(2400);
    expect(metadata.exif).toBeUndefined();
  });
  it('rechaza archivos falsos y SVG aunque se nombren como fotos', async () => {
    await expect(
      normalizePhoto(Buffer.from('<script>alert(1)</script>')),
    ).rejects.toThrow();
    await expect(
      normalizePhoto(
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>',
        ),
      ),
    ).rejects.toThrow();
  });
});
