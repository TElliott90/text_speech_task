import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_DOCUMENT_SIZE } from './document.constants';
import { DocumentService } from './document.service';
import { DocumentDto } from './dto/document.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('convert-to-speech')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_DOCUMENT_SIZE, files: 1, fields: 0 },
    }),
  )
  // async convertToSpeech(
  //   @UploadedFile() file: UploadDocumentDto,
  // ): Promise<DocumentDto> {
  convertToSpeech(@UploadedFile() file: UploadDocumentDto): string {
    // TODO: Extract Text from the document.
    // const extractedText = await this.documentService.extractText(file);
    // TODO: Convert the extracted text to speech.
    // await this.documentService.convertTextToSpeech(file, extractedText);
    return this.documentService.upload(file);
  }
}
