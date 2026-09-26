# Text to Speech Task

A user can upload a text-based file and have it's contents extracted and converted into audio.

## Discovery

For such a broad challenge, some time was taken to determine what to build. Considering my particular interest in Cloud engineering, ideas gravitated around issues or challenges I could pursue in that area. Additional considerations like the time constraint were factored in to create something feasable within the given timeframe.

My initial thought was to deploy a AWS environment using Terraform, as I have always wanted to learn the tool for establishing infrastructure through code. Although after revisiting the challenge brief, it didn't exactly fitted the ‘interesting’ or 'returned an output from a user' element of the task though a case could be made for it.

Continuing down the lines of Cloud services, I noticed a AWS text to speech solution 'AWS Polly' which made me think of the times that I wanted to read some long form text like an article but haven’t had the time to sit down as a parent of 2. This led to an idea of developing a service where a uploaded file can have its content converted into speech, to be downloaded and listened to whilst on walks or while doing chores around the house.

To accomplish this the file would need to be preprocessed first by having it’s text extracted from the document before passing into the text to speech service for conversion. AWS have product called 'Textract' which would be suitable. Python would be the ideal language for this use case as it's a language known for it's data processing capabilities and document processing libraries which can be used for no fee. As I'll be using my familiar Typescript stack, I've come across existing JS repos which can do a similar task such as [pdf-parse](https://github.com/mehmet-kozan/pdf-parse).

Once the text is extracted, the output will need to be sent to a service for converting that text into a speech. Aside from 'AWS Polly' [Eleven Labs](https://elevenlabs.io/) is well known for its text to speech service with higher quality voice output. If you're listening to text-heavy content, use of a more 'polished' voice would be better suited to avoid the robotic chatter of lower quality output although this would mean paying a higher price. For this particular demonstratable usecase and the right constraints, you could get away with utilising a free tier.

## Project Requirements

The workflow for this service would be as follows; User uploads a file -> Text from the file is extracted -> Output from the text extractor is sent to the Text to Speech service -> Audio file returned and temporarily stored locally for the user to be downloaded or listened to.

Additional considerations to be made include the exclusion of certain filetypes, limitations on file size (more to reduce file processing costs), securing api keys to prevent misuse, surfacing errors to the end user, guarding the endpoint and logging activities.

### Tech stack

The tech stack is not the key challenge here, therefore I will be using my familiar stack:
**Frontend**
Vite - Bundler
React Typescript

**Backend**
NestJs

### Commits:

#### Frontend Setup

To start off the project, this monorepo will include a sub directory for the frontend and one for the backend. The frontend folder will be made using the `npm install @vite/latest` command (executed by Codex) which will create a 'frontend' directory that includes all the necessary files within. Once created, the syntax from the template can start being removed and replaced with project code.

#### A user must be able to upload a file

I like to begin by starting to organising the directory, grouping relevant files together e.g. pages into a 'pages' directory, and shared components within a 'components' directory.

#### A file should be sent to backend where the AWS OCR service for text extraction

For setting up the server, I installed the NestJs CLI as per the [instructions](https://docs.nestjs.com/first-steps) and used the nest command to initialise a new project titled 'backend' along with the core files, dependancies and a few templates. Similar to setting up the frontend, I reviewed the newly created project folder to see if there's anything unnecessary which could be removed. I kept the 'getHello' default route to initially test the connection between frontend and backend using a temporary button on the frontend which makes a call to the backend (and console logs any errors thrown). I initially encountered an error where the request was blocked by a CORS policy. I corrected the issue by enabling CORS on the server and specifying the expected origin of the request to grant access which solved the issue. Now that a connection's been made, it's time to setup the document module and routing the frontend request to the module's service for processing the fle upload.

A few subsequent errors also surface where I needed to double check access to env variables from frontend using the vite [guide](https://vite.dev/guide/env-and-mode). A new 404 error was received after where the solution was to correct the env variable to point at the server 'localhost:3000', following the correction, the subsequent 404 was caused by the incorrect route of '/document/convert-to-speech' instead of '/documents/convert-to-speech'.
With the api now reaching the service, it was time for integrating with the text extraction service.

#### Text output must then be sent to AWS Polly (Eleven Labs?) for processing

After testing out AWS Textract with a sample document (see images)

I decided it was not the right solution for my usecase. The service was great at text detection however, contextual extraction is what was needed, otherwise every text available on the document (page number, dates, text found within sample images etc ) would also be extracted and would require filtering. Using a gemini

- Installed Gemini dependancy and followed docs shown [here] (https://aistudio.google.com/docs/get-started?codelanguage=javascript)
- Installation revealed 22 vulnerabilities (5 low, 10 moderate, 7 high), needed to run `npm audit fix --force` to fully resolve the vulnerability issues

- Used google's [docs](https://aistudio.google.com/docs/document-processing?codelanguage=javascript) for sending files

- Issue with document uploading

- Issue with gemini authentication (not reading .env) Earlier npm audit fix force had caused dependency installation issues with incompaible prettier

- Dependancy issue from older NestJs version

#### Audio file to be sent back to the user

#### The file can either be played or downloaded by the user

### Acceptance Criteria:

- A user must be able to upload a file
- Incorrect files formats must be rejected with a surfaced error message in a dialog
- An audio file to be returned and temporarily stored locally on the user's device

### Stretch Goals:

- Allow multiple files to be added by the user + drag and drop
- Utilise AWS Lambda functions for processing requests via the cloud without the need of a running server
- Refine UI for better user experience

## Closing Remarks

For a web application, these fundamentals exist in most projects. A UI is presented to a user, requests are made (additional information may also be included), that request is then processed by the business logic where it either Creates, Reads, Updates, Deletes or Retrieves information for the user, which is then passed back and presented. This is, of course, an over simplification of the workflow and additional layers must also be applied to a 'happy route' such as error handling, testing, security considerations etc
