import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';

describe('Audio download response', () => {
  it('returns the original audio bytes with MP3 download headers', async () => {
    const audio = Buffer.from([0x49, 0x44, 0x33, 0x00, 0xff]);
    const service = new DocumentsService();
    jest.spyOn(service, 'convertTextToSpeech').mockResolvedValue(audio);
    const controller = new DocumentsController(service);
    const result = await controller.convertToSpeech({
      originalname: 'report.txt',
      mimetype: 'text/plain',
      size: 5,
      buffer: Buffer.from('Hello'),
    });

    expect(result.getHeaders()).toEqual({
      type: 'audio/mpeg',
      disposition: 'attachment; filename="output-audio.mp3"',
      length: audio.length,
    });
    const chunks: Buffer[] = [];
    for await (const chunk of result.getStream()) chunks.push(Buffer.from(chunk));
    expect(Buffer.concat(chunks)).toEqual(audio);
  });
});
