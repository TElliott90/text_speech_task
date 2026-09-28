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

#### Frontend

Vite - Build
React (Typescript)

#### Backend

NestJs
Typescript

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

After testing out AWS Textract with a sample document (see images below)

![Textract screenshot1](./1.Example%20Files/Textract-screenshot-1.png)
![Texract screenshot2](./1.Example%20Files/Textract-screenshot-2.png)

I decided it was not the right solution for my usecase. The service was great at text detection however, contextual extraction is what was needed, otherwise every text available on the document (page number, dates, text found within sample images etc ) would also be extracted and would require filtering. Using Google gemini to extract the document from the text using the docs shown [here] (https://aistudio.google.com/docs/get-started?codelanguage=javascript). The installation revealed 22 vulnerabilities (5 low, 10 moderate, 7 high), needed to run `npm audit fix --force` to fully resolve the vulnerability issues

- Used google's [docs](https://aistudio.google.com/docs/document-processing?codelanguage=javascript) for sending files

- Issue with gemini authentication (not reading .env) Earlier npm audit fix force had caused dependency installation issues with incompaible prettier

- Dependancy issue from older NestJs version, updated version was able to resolve the aforementioned vulnerabilities.

#### Audio file to be sent back to the user

- 402 error using the API key with 'billing required' error message initial thought a paid plan was required however it was the voiceid that was being sent was not eligible on a free tier account.

#### The file can either be played or downloaded by the user

- Took some time to understand the concept of converting audio file data of a initially a readable stream, to a Buffer before constructing a [streamablefile](https://docs.nestjs.com/http/file-upload#streaming-files)
- Decision was made to download directly after conversion was completed instead of utilising an audio player for simplicity sake.

### Acceptance Criteria:

- A user must be able to upload a file
- Incorrect files formats must be rejected with a surfaced error message in a dialog
- An audio file to be returned and temporarily stored locally on the user's device

### Stretch Goals:

- Allow multiple files to be added by the user + drag and drop
- Utilise AWS Lambda functions for processing requests via the cloud without the need of a running server
- Refine UI for better user experience

## Closing Remarks

For a web application, the fundamentals of presenting a UI to a user, making requests to a server and processing that information before returning new information exist in most projects. Despite this straightforward approach, there are still many considerations such as tooling and services (including their own limitations) which change during development when they don't become feasable, while also factoring in strict discipline on what to build and what to leave to avoid feature creep. Additional layers must also be applied to a 'happy route' such as error handling, testing, security considerations etc to which all adds to extended time of a project. I do not believe that the overall time spent on developing the solution has taken much more than 3 hours, though more time has been added in writing these logs. The lessons learnt from this project have revealed additional factors to consider when chosing external services for a solution i.e. contraints of the service, the extraction of text and nuances of what it means to retrieve the specific information from the content, and the handling of files (specifically audio) and the conversions required to transport and download the data.

Before exceeding limits of Eleven Labs, an example of the audio [output](./1.Example%20Files/Audio%20-%20Example%20Report-%20Current%20Cloud%20Technology%20Trends%20in%20the%20UK.mp3) was retrieved from this [file](./1.Example%20Files/Example%20Report-%20Current%20Cloud%20Technology%20Trends%20in%20the%20UK.pdf). The audio script alters from the document as the prompt used for extracting was requesting the key points from the document, which is not a bad thing depending if you're after a quick summary of key points of a large document. This should be taken into consideration and relayed back to the user to ensure they're not expecting a word-for-word extract or put in place an option which specifies how the document should be interpreted.

### Notes

- Larger projects would require their own seperate files for api calls, types etc
- Improvements could be made to UI to better illustrate the ability to remove files
- Could add an additional option to pass with the conversion request to determine whether or not to extract all of the main text or just the key points (for long documents)
- Conversion time can take a while, animated loading icon might help users with the wait.
- Using LLM (Gemini) can risk from source document. Explicit prompt instructions must be used to faithfully follow the content.
- A 5000 character limit is placed on the Eleven Labs service. Shorter passages are best used.
