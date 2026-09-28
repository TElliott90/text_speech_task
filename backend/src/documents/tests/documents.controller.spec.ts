import { BadRequestException } from '@nestjs/common';
import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';

describe('DocumentsController', () => {
  let service: DocumentsService;
  let controller: DocumentsController;
  const file = {
    originalname: 'report.txt',
    mimetype: 'text/plain',
    size: 5,
    buffer: Buffer.from('Hello'),
  };

  beforeEach(() => {
    service = new DocumentsService();
    controller = new DocumentsController(service);
  });

  it('extracts the uploaded document and converts the extracted text', async () => {
    const extract = jest
      .spyOn(service, 'extractText')
      .mockResolvedValue('Extracted text');
    const convert = jest
      .spyOn(service, 'convertTextToSpeech')
      .mockResolvedValue(Buffer.from('audio'));

    await controller.convertToSpeech(file);

    expect(extract).toHaveBeenCalledWith(file);
    expect(convert).toHaveBeenCalledWith('Extracted text');
  });

  it('does not request speech when extraction fails', async () => {
    const error = new BadRequestException('Extraction failed');
    jest.spyOn(service, 'extractText').mockRejectedValue(error);
    const convert = jest.spyOn(service, 'convertTextToSpeech');

    await expect(controller.convertToSpeech(file)).rejects.toBe(error);
    expect(convert).not.toHaveBeenCalled();
  });
});
