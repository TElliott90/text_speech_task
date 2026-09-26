// Multipart file data supplied by Nest's FileInterceptor (memory storage).
export class UploadDocumentDto {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
