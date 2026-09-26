import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from './document/document.module';
import { DocumentController } from './document/document.controller';

@Module({
  imports: [DocumentModule],
  controllers: [AppController, DocumentController],
  providers: [AppService],
})
export class AppModule {}
