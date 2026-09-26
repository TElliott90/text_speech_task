import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_DOCUMENT_SIZE } from './documents.constants';
import { DocumentsService } from './documents.service';
import { DocumentDto } from './dto/document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('convert-to-speech')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_DOCUMENT_SIZE, files: 1, fields: 0 },
    }),
  )
  // async convertToSpeech(
  //   @UploadedFile() file: UploadDocumentDto,
  // ): Promise<DocumentDto> {
  async convertToSpeech(
    @UploadedFile() file: UploadDocumentDto,
  ): Promise<string> {
    console.log('Received file:', file.originalname, 'Size:', file.size);

    // TODO: Extract Text from the document.
    const extractedText = await this.documentsService.extractText(file);
    // TODO: Convert the extracted text to speech.
    // await this.documentService.convertTextToSpeech(file, extractedText);
    return extractedText;
  }
}
