import { Module } from '@nestjs/common';
import { join } from 'path';
import { DOCUMENT_UPLOAD_DIRECTORY } from './document.constants';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    {
      provide: DOCUMENT_UPLOAD_DIRECTORY,
      useFactory: () => join(process.cwd(), 'uploads', 'documents'),
    },
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
