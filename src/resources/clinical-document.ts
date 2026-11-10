import { BadRequestException } from '@nestjs/common';

/** Restricted Tiptap JSON. Never accepts HTML, URLs, embedded media or arbitrary attributes. */
export function validateClinicalDocument(value: unknown): unknown {
  const fail = (): never => {
    throw new BadRequestException(
      'Documento clínico inválido o demasiado grande',
    );
  };
  if (Buffer.byteLength(JSON.stringify(value) ?? '') > 1048576) fail();
  // Normalize browser-produced styles without accepting arbitrary CSS.
  value = structuredClone(value);
  let textLength = 0;
  let nodes = 0;
  const blocks = [
    'paragraph',
    'heading',
    'bulletList',
    'orderedList',
    'blockquote',
    'horizontalRule',
  ];
  const allowed: Record<string, string[]> = {
    doc: blocks,
    paragraph: ['text', 'hardBreak'],
    heading: ['text', 'hardBreak'],
    bulletList: ['listItem'],
    orderedList: ['listItem'],
    listItem: [...blocks],
    blockquote: blocks,
    text: [],
    hardBreak: [],
    horizontalRule: [],
  };
  function node(raw: unknown, depth: number, parent?: string) {
    if (
      !raw ||
      typeof raw !== 'object' ||
      Array.isArray(raw) ||
      depth > 12 ||
      ++nodes > 30000
    )
      fail();
    const n = raw as Record<string, unknown>;
    if (
      Object.keys(n).some(
        (k) => !['type', 'content', 'attrs', 'marks', 'text'].includes(k),
      )
    )
      fail();
    const type = String(n.type);
    if (
      !Object.hasOwn(allowed, type) ||
      (!parent && type !== 'doc') ||
      (parent && !allowed[parent].includes(type))
    )
      fail();
    if (type === 'text') {
      if (typeof n.text !== 'string' || !n.text.length || n.text.includes('\0'))
        fail();
      textLength += (n.text as string).length;
      if (
        textLength > 200000 ||
        n.content !== undefined ||
        n.attrs !== undefined
      )
        fail();
    } else if (n.text !== undefined) fail();
    if (n.attrs !== undefined) {
      if (!n.attrs || typeof n.attrs !== 'object' || Array.isArray(n.attrs))
        fail();
      const attrs = n.attrs as Record<string, unknown>;
      if (attrs.lineHeight === '' || attrs.lineHeight === 'normal')
        attrs.lineHeight = null;
      for (const [key, val] of Object.entries(attrs)) {
        if (
          key === 'textAlign' &&
          ['paragraph', 'heading'].includes(type) &&
          [null, 'left', 'center', 'right', 'justify'].includes(
            val as string | null,
          )
        )
          continue;
        if (
          key === 'lineHeight' &&
          ['paragraph', 'heading'].includes(type) &&
          [null, '1', '1.15', '1.5', '2'].includes(val as string | null)
        )
          continue;
        if (
          key === 'level' &&
          type === 'heading' &&
          [1, 2, 3].includes(Number(val)) &&
          typeof val === 'number'
        )
          continue;
        if (
          key === 'start' &&
          type === 'orderedList' &&
          Number.isSafeInteger(val) &&
          Number(val) > 0 &&
          Number(val) <= 100000
        )
          continue;
        if (key === 'type' && type === 'orderedList' && val === null) continue;
        fail();
      }
    }
    if (
      type === 'heading' &&
      ![1, 2, 3].includes(
        Number((n.attrs as Record<string, unknown> | undefined)?.level),
      )
    )
      fail();
    if (n.marks !== undefined) {
      if (
        !['text', 'hardBreak'].includes(type) ||
        !Array.isArray(n.marks) ||
        n.marks.length > 6
      )
        fail();
      for (const mark of n.marks as unknown[]) {
        if (!mark || typeof mark !== 'object' || Array.isArray(mark)) fail();
        const m = mark as Record<string, unknown>;
        if (m.type === 'textStyle') {
          if (
            Object.keys(m).some((k) => !['type', 'attrs'].includes(k)) ||
            !m.attrs ||
            typeof m.attrs !== 'object' ||
            Array.isArray(m.attrs)
          )
            fail();
          const styles = m.attrs as Record<string, unknown>;
          for (const key of Object.keys(styles)) {
            let val = styles[key];
            if (val === '') val = null;
            if (
              ['color', 'backgroundColor'].includes(key) &&
              typeof val === 'string'
            ) {
              const rgb =
                /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*1(?:\.0+)?)?\s*\)$/.exec(
                  val,
                );
              if (rgb && rgb.slice(1, 4).every((c) => Number(c) <= 255))
                val =
                  '#' +
                  rgb
                    .slice(1, 4)
                    .map((c) => Number(c).toString(16).padStart(2, '0'))
                    .join('');
            }
            if (key === 'fontFamily' && typeof val === 'string')
              val = val.replace(/^(['"])(.*)\1$/, '$2');
            if (
              key === 'fontSize' &&
              typeof val === 'string' &&
              /^\d+(?:\.\d+)?px$/.test(val)
            )
              val = `${Number.parseFloat(val) * 0.75}pt`;
            styles[key] = val;
            if (
              !['fontFamily', 'fontSize', 'color', 'backgroundColor'].includes(
                key,
              )
            )
              fail();
            if (val === null) continue;
            if (
              key === 'fontFamily' &&
              typeof val === 'string' &&
              [
                'Arial',
                'Calibri',
                'Aptos',
                'Georgia',
                'Times New Roman',
                'Verdana',
              ].includes(val)
            )
              continue;
            if (
              key === 'fontSize' &&
              typeof val === 'string' &&
              [
                '8pt',
                '9pt',
                '10pt',
                '11pt',
                '12pt',
                '14pt',
                '16pt',
                '18pt',
                '20pt',
                '24pt',
                '28pt',
                '32pt',
                '36pt',
                '48pt',
              ].includes(val)
            )
              continue;
            if (
              ['color', 'backgroundColor'].includes(key) &&
              typeof val === 'string' &&
              /^#[0-9a-f]{6}$/i.test(val)
            )
              continue;
            fail();
          }
          continue;
        }
        if (
          Object.keys(m).some((k) => k !== 'type') ||
          !['bold', 'italic', 'underline', 'strike', 'code'].includes(
            String(m.type),
          )
        )
          fail();
      }
    }
    if (n.content !== undefined) {
      if (!Array.isArray(n.content) || !allowed[type].length) fail();
      for (const child of n.content as unknown[]) node(child, depth + 1, type);
    }
    if (
      ['doc', 'bulletList', 'orderedList', 'listItem', 'blockquote'].includes(
        type,
      ) &&
      (!Array.isArray(n.content) || !n.content.length)
    )
      fail();
    if (
      type === 'listItem' &&
      (n.content as { type: string }[])[0]?.type !== 'paragraph'
    )
      fail();
  }
  node(value, 0);
  return value;
}
