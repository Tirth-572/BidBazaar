import fs from 'fs';
import path from 'path';

/** Parse multipart/form-data (fields + optional file). */
export async function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  const match = contentType.match(/boundary=(.+?)(?:;|$)/i);
  if (!match) return { fields: {}, file: null };

  const boundaryRaw = match[1].trim().replace(/^["']|["']$/g, '');
  const boundary = Buffer.from(`--${boundaryRaw}`);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const fields = {};
  let file = null;
  let pos = 0;

  while (pos < buffer.length) {
    const start = buffer.indexOf(boundary, pos);
    if (start === -1) break;
    let partStart = start + boundary.length;
    if (buffer[partStart] === 0x0d && buffer[partStart + 1] === 0x0a) partStart += 2;
    if (buffer.slice(partStart, partStart + 2).toString() === '--') break;

    const next = buffer.indexOf(boundary, partStart);
    const partEnd = next === -1 ? buffer.length : next;
    const part = buffer.slice(partStart, partEnd);
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) {
      pos = partEnd;
      continue;
    }

    const headers = part.slice(0, headerEnd).toString('utf8');
    let body = part.slice(headerEnd + 4);
    if (body.length >= 2 && body[body.length - 2] === 0x0d && body[body.length - 1] === 0x0a) {
      body = body.slice(0, -2);
    }

    const nameMatch = headers.match(/name="([^"]+)"/);
    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const name = nameMatch?.[1];
    if (!name) {
      pos = partEnd;
      continue;
    }

    if (filenameMatch) {
      file = {
        fieldname: name,
        originalname: filenameMatch[1],
        buffer: body,
      };
    } else {
      fields[name] = body.toString('utf8').trim();
    }
    pos = partEnd;
  }

  return { fields, file };
}

export function saveUploadedFile(file, destDir) {
  if (!file?.buffer?.length) return null;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const ext = path.extname(file.originalname || '.jpg') || '.jpg';
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const fullPath = path.join(destDir, filename);
  fs.writeFileSync(fullPath, file.buffer);
  return `images/${filename}`;
}
