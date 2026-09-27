import {
  Controller,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MAX_DOCUMENT_SIZE } from './documents.constants';
import { DocumentsService } from './documents.service';
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
  async convertToSpeech(
    @UploadedFile() file: UploadDocumentDto,
  ): Promise<StreamableFile> {
    const extractedText = await this.documentsService.extractText(file);

    const audio = await this.documentsService.convertTextToSpeech(
      extractedText,
    );
    return new StreamableFile(audio, {
      type: 'audio/mpeg',
      disposition: 'attachment; filename="output-audio.mp3"',
      length: audio.length,
    });
  }
}
