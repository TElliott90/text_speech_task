import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MAX_DOCUMENT_SIZE } from './documents.constants';
import { UploadDocumentDto } from './dto/upload-document.dto';

import { GoogleGenAI } from '@google/genai';

@Injectable()
export class DocumentsService {
  async extractText(file: UploadDocumentDto): Promise<string> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('A non-empty file is required.');
    }
    if (file.buffer.length > MAX_DOCUMENT_SIZE) {
      throw new PayloadTooLargeException('File must be smaller then 10 MB');
    }

    const extension = file.originalname.split('.').pop()?.toLowerCase();

    if (!['txt', 'pdf', 'doc', 'docx'].includes(extension)) {
      throw new BadRequestException(
        'Please upload a TXT, PDF, DOC, or DOCX file.',
      );
    }

    //Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      // Section could be improved to utilise different models
      const extractedText = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: [
          {
            type: 'text',
            // text: 'Please extract the main text from the document. Return only the extracted text.',
            text: 'Please extract the key points from the document. Return only the extracted text.',
          },
          //Convert the file to base64 if it's a PDF, otherwise treat it as text
          extension === 'pdf'
            ? {
                type: 'document',
                data: file.buffer.toString('base64'),
                mime_type: 'application/pdf',
              }
            : { type: 'text', text: file.buffer.toString('utf8') },
        ],
      });

      console.log(
        `Length of extracted text from ${file.originalname}:`,
        extractedText.output_text.length,
      );

      //Limiter to reduce usage(5000 characters is the limit for Eleven Labs)
      if (extractedText.output_text.length > 2000) {
        throw new BadRequestException('Extracted text is too long.');
      }

      return extractedText.output_text;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new BadRequestException(
        'Failed to extract text from the document.',
      );
    }
  }
}
