import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { AppModule } from '../src/app.module';
import { MAX_DOCUMENT_SIZE } from '../src/documents/documents.constants';
import {
  it,
  describe,
  jest,
  beforeEach,
  afterEach,
  expect,
} from '@jest/globals';

jest.mock('@google/genai');
jest.mock('@elevenlabs/elevenlabs-js');

describe('Document conversion (e2e)', () => {
  let app: INestApplication;
  const extract = jest.fn();
  const convert = jest.fn();
  const audio = Buffer.from([0x49, 0x44, 0x33, 0x00, 0xff]);
  const endpoint = '/documents/convert-to-speech';

  beforeEach(async () => {
    jest.resetAllMocks();
    (GoogleGenAI as jest.Mock).mockImplementation(() => ({
      interactions: { create: extract },
    }));
    (ElevenLabsClient as jest.Mock).mockImplementation(() => ({
      textToSpeech: { convert },
    }));
    extract.mockResolvedValue({ output_text: 'Hello' });
    convert.mockImplementation(async () => ({
      getReader: () => ({
        read: jest
          .fn()
          .mockResolvedValueOnce({ done: false, value: audio })
          .mockResolvedValue({ done: true }),
        releaseLock: jest.fn(),
      }),
    }));
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('receives a multipart document and returns the MP3 bytes', async () => {
    const response = await request(app.getHttpServer())
      .post(endpoint)
      .attach('file', Buffer.from('Hello'), 'report.txt')
      .expect(201)
      .expect('Content-Type', 'audio/mpeg')
      .expect('Content-Disposition', 'attachment; filename="output-audio.mp3"')
      .expect('Content-Length', String(audio.length));
    expect(response.body).toEqual(audio);
    expect(convert).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ text: 'Hello' }),
    );
  });

  it('rejects a missing file', async () => {
    await request(app.getHttpServer()).post(endpoint).send({}).expect(400);
    expect(extract).not.toHaveBeenCalled();
    expect(convert).not.toHaveBeenCalled();
  });

  it.each([
    ['file', 'empty.txt', Buffer.alloc(0)],
    ['file', 'script.exe', Buffer.from('invalid')],
    ['wrongField', 'report.txt', Buffer.from('Hello')],
  ])('rejects invalid upload %s / %s', async (field, name, content) => {
    await request(app.getHttpServer())
      .post(endpoint)
      .attach(field, content, name)
      .expect(400);
    expect(extract).not.toHaveBeenCalled();
    expect(convert).not.toHaveBeenCalled();
  });

  it('rejects oversized uploads', async () => {
    await request(app.getHttpServer())
      .post(endpoint)
      .attach('file', Buffer.alloc(MAX_DOCUMENT_SIZE + 1), 'large.txt')
      .expect(413);
    expect(extract).not.toHaveBeenCalled();
    expect(convert).not.toHaveBeenCalled();
  });

  it('returns an error when extraction fails', async () => {
    extract.mockRejectedValue(new Error('Provider unavailable'));
    await request(app.getHttpServer())
      .post(endpoint)
      .attach('file', Buffer.from('Hello'), 'report.txt')
      .expect(400);
    expect(convert).not.toHaveBeenCalled();
  });

  it('returns an error when speech conversion fails', async () => {
    convert.mockRejectedValue(new Error('Provider unavailable'));
    await request(app.getHttpServer())
      .post(endpoint)
      .attach('file', Buffer.from('Hello'), 'report.txt')
      .expect(400);
  });
});
