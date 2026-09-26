import { Module } from '@nestjs/common';
import { join } from 'path';
import { DOCUMENT_UPLOAD_DIRECTORY } from './documents.constants';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    {
      provide: DOCUMENT_UPLOAD_DIRECTORY,
      useFactory: () => join(process.cwd(), 'uploads', 'documents'),
    },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
