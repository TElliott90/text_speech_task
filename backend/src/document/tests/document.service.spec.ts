import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { mkdtemp, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { MAX_DOCUMENT_SIZE } from '../document.constants';
import { DocumentService } from '../document.service';

describe('DocumentService', () => {
  let directory: string;
  let service: DocumentService;
  const file = (
    originalname = 'report.txt',
    buffer = Buffer.from('Hello'),
  ) => ({
    originalname,
    buffer,
    size: buffer.length,
    mimetype: 'application/octet-stream',
  });

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'document-test-'));
    service = new DocumentService(join(directory, 'documents'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it.each(['txt', 'pdf', 'doc', 'docx', 'TXT'])(
    'stores a %s upload with its original bytes',
    async (extension) => {
      const upload = file(`report.${extension}`);
      const result = await service.upload(upload);
      expect(result).toEqual({
        id: expect.any(String),
        originalName: upload.originalname,
        mimeType: upload.mimetype,
        size: upload.size,
      });
      expect(
        await readFile(
          join(
            directory,
            'documents',
            `${result.id}.${extension.toLowerCase()}`,
          ),
        ),
      ).toEqual(upload.buffer);
    },
  );

  it('uses unique storage names instead of client paths', async () => {
    const first = await service.upload(file('../../report.txt'));
    const second = await service.upload(file('../../report.txt'));
    expect(first.id).not.toBe(second.id);
    expect(await readdir(join(directory, 'documents'))).toEqual(
      expect.arrayContaining([`${first.id}.txt`, `${second.id}.txt`]),
    );
  });

  it.each([undefined, file('empty.txt', Buffer.alloc(0)), file('script.exe')])(
    'rejects missing, empty, or unsupported files without storing them',
    async (upload) => {
      await expect(service.upload(upload)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('rejects oversized files', async () => {
    await expect(
      service.upload(file('large.txt', Buffer.alloc(MAX_DOCUMENT_SIZE + 1))),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    expect(await readdir(directory)).toEqual([]);
  });
});
