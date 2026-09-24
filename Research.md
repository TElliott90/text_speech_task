#Text to Speech Task
A user can upload a text-based file and have it's contents extracted and converted into audio.

##Discovery
For such a broad challenge, some time was taken to determine what to build. Considering my particular interest in Cloud engineering, ideas gravitated around issues or challenges I could pursue in that area. Additional considerations like the time constraint were factored in to create something feasable within the given timeframe.

My initial thought was to deploy a AWS environment using Terraform, as I have always wanted to learn the tool for establishing infrastructure through code. Although after revisiting the challenge brief, it didn't exactly fitted the ‘interesting’ or 'returned an output from a user' element of the task though a case could be made for it.

Continuing down the lines of Cloud services, I noticed a AWS text to speech solution 'AWS Polly' which made me think of the times that I wanted to read some long form text like an article but haven’t had the time to sit down as a parent of 2. This led to an idea of developing a service where a uploaded file can have its content converted into speech, to be downloaded and listened to whilst on walks or while doing chores around the house.

To accomplish this the file would need to be preprocessed first by having it’s text extracted from the document before passing into the text to speech service for conversion. AWS have product called 'Textract' which would be suitable. Python would be the ideal language for this use case as it's a language known for it's data processing capabilities and document processing libraries which can be used for no fee. As I've decided on a familiar Typescript stack, I found existing JS repos which can do a similar task such as [https://github.com/mehmet-kozan/pdf-parse] pdf-parse.

##Project Requirements

The workflow for this service would be as follows; User uploads a file -> Text from the file is extracted -> Output from the text extractor is sent to the Text to Speech service -> Audio file returned and temporarily stored locally for the user to be downloaded or listened to.

Additional considerations to be made include the exclusion of certain filetypes, limitations on file size (more to reduce file processing costs), securing api keys to prevent misuse, surfacing errors to the end user, guarding the endpoint and logging activities.

**Tech stack.**
The tech stack is not the key challenge here, therefore I will be using my familiar stack:
Frontend
Vite - Bundler
React Typescript -

Backend
NestJs

**Commits:**

- A user must be upload a file
  - File validation must be included to reject unsupported file formats
  -
- A file should be sent to backend where the AWS OCR service for text extraction
- Text output must then be sent to AWS Polly (Eleven Labs?) for processing
- MP3 file to be sent back to the user
- The file can either be played or downloaded by the user

**Stretch Goals:**

- Allow multiple files to be added by the user + drag and drop
- Utilise AWS Lambda functions for processing requests via the cloud without the need of a running server
- Refine UI for better user experience

**Acceptance Criteria:**

- A user must be able to upload a file
- Incorrect files formats must be rejected with a surfaced error message in a dialog
- An audio file to be returned and temporarily stored locally on the user's device
