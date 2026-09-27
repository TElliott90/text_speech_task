import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { mkdtemp, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { MAX_DOCUMENT_SIZE } from '../documents.constants';
import { DocumentService } from '../documents.service';

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
    'stores a %s extractText with its original bytes',
    async (extension) => {
      const extractText = file(`report.${extension}`);
      const result = await service.extractText(extractText);
      expect(result).toEqual({
        id: expect.any(String),
        originalName: extractText.originalname,
        mimeType: extractText.mimetype,
        size: extractText.size,
      });
      expect(
        await readFile(
          join(
            directory,
            'documents',
            `${result.id}.${extension.toLowerCase()}`,
          ),
        ),
      ).toEqual(extractText.buffer);
    },
  );

  it.each([undefined, file('empty.txt', Buffer.alloc(0)), file('script.exe')])(
    'rejects missing, empty, or unsupported files without storing them',
    async (extractText) => {
      await expect(service.extractText(extractText)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('rejects oversized files', async () => {
    await expect(
      service.extractText(
        file('large.txt', Buffer.alloc(MAX_DOCUMENT_SIZE + 1)),
      ),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    expect(await readdir(directory)).toEqual([]);
  });
});
