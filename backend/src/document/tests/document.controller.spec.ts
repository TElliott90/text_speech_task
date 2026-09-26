import { DocumentController } from '../document.controller';
import { DocumentService } from '../document.service';

describe('DocumentController', () => {
  it('passes the uploaded file to the service and returns its result', async () => {
    const service = new DocumentService('/unused');
    const result = {
      id: 'document-id',
      originalName: 'report.txt',
      mimeType: 'text/plain',
      size: 5,
    };
    const upload = jest.spyOn(service, 'upload').mockResolvedValue(result);
    const controller = new DocumentController(service);
    const file = {
      originalname: 'report.txt',
      mimetype: 'text/plain',
      size: 5,
      buffer: Buffer.from('Hello'),
    };

    await expect(controller.upload(file)).resolves.toEqual(result);
    expect(upload).toHaveBeenCalledWith(file);
  });
});
