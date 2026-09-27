import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
} from '@nestjs/common';
import { MAX_DOCUMENT_SIZE } from './documents.constants';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

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

    //GEMINI
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
      // This section could be improved to utilise different models
      const extractedText = await ai.interactions.create({
        model: 'gemini-3.8-flash',
        input: [
          {
            type: 'text',
            text: 'Please extract the main text from the source document. Return only the exact, extracted text and do not alter the source material',
            // text: 'Please extract the key points from the document. Return only the extracted text.',
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

      //Limiter to reduce usage (5000 characters is the limit for Eleven Labs)
      if (extractedText.output_text.length > 2000) {
        throw new BadRequestException('Extracted text is too long.');
      }

      return extractedText.output_text;
    } catch (error) {
      throw new BadRequestException(
        'Failed to extract text from the document.',
      );
    }
  }

  async convertTextToSpeech(text: string): Promise<Buffer> {
    if (!text || text.trim().length === 0) {
      throw new BadRequestException('Text is required for conversion.');
    }

    try {
      const elevenLabsClient = new ElevenLabsClient({
        apiKey: process.env.ELEVENLABS_API_KEY,
      });

      const audio = await elevenLabsClient.textToSpeech.convert(
        //VoiceId - can be additional voices, although choice is limited on free tier
        'CwhRBWXzGAHq8TQ4Fs17',
        {
          text,
          modelId: 'eleven_v3',
          outputFormat: 'mp3_44100_128',
        },
      );

      const reader = audio.getReader();
      const chunks: Buffer[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(Buffer.from(value));
        }
      } finally {
        reader.releaseLock();
      }
      return Buffer.concat(chunks);
    } catch (error) {
      throw new BadRequestException(
        'Failed to convert text to speech. Please try again later.',
      );
    }
  }
}
