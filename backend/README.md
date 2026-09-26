## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Document uploads

The backend accepts `POST http://localhost:3000/documents` with a
`multipart/form-data` field named `file`. Send one non-empty TXT, PDF, DOC, or
DOCX file, up to 10 MB. Extensions are checked case-insensitively; document
contents are not parsed or converted to speech by this endpoint.

```ts
const formData = new FormData();
formData.append('file', selectedFile);
const response = await fetch('http://localhost:3000/documents', {
  method: 'POST',
  body: formData,
});
const document = await response.json();
if (!response.ok) throw new Error(document.message);
```

Let the browser set the multipart Content-Type and boundary. A successful request
returns HTTP 201 with `{ id, originalName, mimeType, size }` (size in bytes).
Invalid or missing files return HTTP 400; oversized files return HTTP 413.
The MIME type is client-supplied metadata, not a verified content type.
Files are saved under `uploads/documents` relative to the backend's working
directory, using generated UUID filenames. This directory is excluded from Git.
The frontend Convert button still needs to be connected to this endpoint.

Run backend checks from `backend`:

```sh
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
```
