import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mkdtemp, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { expect, it, describe, beforeEach, afterEach } from 'jest';
import {
  DOCUMENT_UPLOAD_DIRECTORY,
  MAX_DOCUMENT_SIZE,
} from '../src/document/document.constants';

describe('Document uploads (e2e)', () => {
  let app: INestApplication;
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'document-e2e-'));
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DOCUMENT_UPLOAD_DIRECTORY)
      .useValue(directory)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  });

  it('receives a multipart file and returns document metadata', async () => {
    const response = await request(app.getHttpServer())
      .post('/documents')
      .attach('file', Buffer.from('Hello'), 'report.txt')
      .expect(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      originalName: 'report.txt',
      mimeType: 'text/plain',
      size: 5,
    });
    expect(await readdir(directory)).toEqual([`${response.body.id}.txt`]);
  });

  it('rejects a missing file', async () => {
    await request(app.getHttpServer()).post('/documents').send({}).expect(400);
  });

  it.each([
    ['file', 'empty.txt', Buffer.alloc(0)],
    ['file', 'script.exe', Buffer.from('invalid')],
    ['wrongField', 'report.txt', Buffer.from('Hello')],
  ])('rejects invalid upload %s / %s', async (field, name, content) => {
    await request(app.getHttpServer())
      .post('/documents')
      .attach(field, content, name)
      .expect(400);
    expect(await readdir(directory)).toEqual([]);
  });

  it('rejects oversized uploads', async () => {
    await request(app.getHttpServer())
      .post('/documents')
      .attach('file', Buffer.alloc(MAX_DOCUMENT_SIZE + 1), 'large.txt')
      .expect(413);
    expect(await readdir(directory)).toEqual([]);
  });

  it('rejects multiple files', async () => {
    await request(app.getHttpServer())
      .post('/documents')
      .attach('file', Buffer.from('one'), 'one.txt')
      .attach('file', Buffer.from('two'), 'two.txt')
      .expect(400);
    expect(await readdir(directory)).toEqual([]);
  });
});
