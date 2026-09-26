import {
  BadRequestException,
  Inject,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import {
  DOCUMENT_UPLOAD_DIRECTORY,
  MAX_DOCUMENT_SIZE,
} from './document.constants';
import { DocumentDto } from './dto/document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @Inject(DOCUMENT_UPLOAD_DIRECTORY) private readonly uploadDirectory: string,
  ) {}

  // async upload(file: UploadDocumentDto): Promise<DocumentDto> {
  upload(file: UploadDocumentDto): string {
    return `File recieved: ${file.originalname}`;
    // if (!file || !file.buffer || file.buffer.length === 0) {
    //   throw new BadRequestException('A non-empty file is required.');
    // }
    // if (file.buffer.length > MAX_DOCUMENT_SIZE) {
    //   throw new PayloadTooLargeException('File must be 10 MB or smaller.');
    // }

    // const extension = extname(file.originalname).toLowerCase();

    // if (!['.txt', '.pdf', '.doc', '.docx'].includes(extension)) {
    //   throw new BadRequestException(
    //     'Please upload a TXT, PDF, DOC, or DOCX file.',
    //   );
    // }

    // //

    // return file;
  }
}
