import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { MAX_DOCUMENT_SIZE } from '../documents.constants';
import { DocumentsService } from '../documents.service';

jest.mock('@google/genai');
jest.mock('@elevenlabs/elevenlabs-js');

describe('DocumentsService', () => {
  let service: DocumentsService;
  const extract = jest.fn();
  const convert = jest.fn();
  const file = (
    originalname = 'report.txt',
    buffer = Buffer.from('Hello'),
  ) => ({
    originalname,
    buffer,
    size: buffer.length,
    mimetype: 'application/octet-stream',
  });

  beforeEach(() => {
    jest.resetAllMocks();
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      interactions: { create: extract },
    }));
    (ElevenLabsClient as jest.Mock).mockImplementation(() => ({
      textToSpeech: { convert },
    }));
    extract.mockResolvedValue({ output_text: 'Extracted text' });
    service = new DocumentsService();
  });

  it.each(['txt', 'pdf', 'doc', 'docx', 'TXT'])(
    'extracts text from a %s document',
    async (extension) => {
      const document = file(`report.${extension}`);
      await expect(service.extractText(document)).resolves.toBe(
        'Extracted text',
      );
      expect(extract).toHaveBeenCalledWith(
        expect.objectContaining({
          input: [
            expect.objectContaining({ type: 'text' }),
            extension === 'pdf'
              ? {
                  type: 'document',
                  data: document.buffer.toString('base64'),
                  mime_type: 'application/pdf',
                }
              : { type: 'text', text: 'Hello' },
          ],
        }),
      );
    },
  );

  it.each([undefined, file('empty.txt', Buffer.alloc(0)), file('script.exe')])(
    'rejects invalid files before contacting Gemini',
    async (document) => {
      await expect(service.extractText(document)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(GoogleGenAI).not.toHaveBeenCalled();
    },
  );

  it('rejects oversized files before contacting Gemini', async () => {
    await expect(
      service.extractText(
        file('large.txt', Buffer.alloc(MAX_DOCUMENT_SIZE + 1)),
      ),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    expect(GoogleGenAI).not.toHaveBeenCalled();
  });

  it('accepts extracted text at the character limit', async () => {
    extract.mockResolvedValue({ output_text: 'a'.repeat(2000) });
    await expect(service.extractText(file())).resolves.toBe('a'.repeat(2000));
  });

  it('rejects extracted text over the character limit', async () => {
    extract.mockResolvedValue({ output_text: 'a'.repeat(2001) });
    await expect(service.extractText(file())).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('reports extraction provider failures', async () => {
    extract.mockRejectedValue(new Error('Provider unavailable'));
    await expect(service.extractText(file())).rejects.toThrow(
      'Failed to extract text from the document.',
    );
  });

  it.each(['', '   ', undefined])(
    'rejects empty speech input',
    async (text) => {
      await expect(service.convertTextToSpeech(text)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(ElevenLabsClient).not.toHaveBeenCalled();
    },
  );

  it('combines audio chunks and releases the stream reader', async () => {
    const reader = {
      read: jest
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: Uint8Array.from([0x49, 0x44]),
        })
        .mockResolvedValueOnce({
          done: false,
          value: Uint8Array.from([0x33, 0xff]),
        })
        .mockResolvedValueOnce({ done: true }),
      releaseLock: jest.fn(),
    };
    convert.mockResolvedValue({ getReader: () => reader });
    await expect(service.convertTextToSpeech('Hello')).resolves.toEqual(
      Buffer.from([0x49, 0x44, 0x33, 0xff]),
    );
    expect(convert).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ text: 'Hello', outputFormat: 'mp3_44100_128' }),
    );
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });

  it('reports speech provider failures', async () => {
    convert.mockRejectedValue(new Error('Provider unavailable'));
    await expect(service.convertTextToSpeech('Hello')).rejects.toThrow(
      'Failed to convert text to speech. Please try again later.',
    );
  });

  it('releases the reader when reading audio fails', async () => {
    const reader = {
      read: jest.fn().mockRejectedValue(new Error('Stream failed')),
      releaseLock: jest.fn(),
    };
    convert.mockResolvedValue({ getReader: () => reader });
    await expect(service.convertTextToSpeech('Hello')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(reader.releaseLock).toHaveBeenCalledTimes(1);
  });
});
