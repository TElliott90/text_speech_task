# AI usage

Model - GPT-6 Astra (Light) via integrated Codex inside VSCode

Primary use was generating basic components quickly, reducing time taken to troubleshoot and producing detailed README documentation which has been reviewed before submitting.

Additional generated syntax was observered along with misunderstood instructions. Reviewing the output helps reduce unnecessary

## Commit 1 - "Frontend setup"

- Prompt - “Initialise a directory titled 'frontend' with vite using react and typescript”
  Used to quickly frontend and installing vite as bundler with react + typescript as the library
  Approved command **‘`npm create vite@latest frontend -- --template react-ts’`** which installs the latest vite, specifies the react typescript template in a directory called ‘frontend’

## Commit 2 - "A user must be able to upload a file"

- Prompt - "Create a UI that enables a user to upload a file. The page (FileUploadPage.tsx) should contain a single button icon in the center (FileUploader.tsx) which opens to a file select screen allowing the user to select their chosen file. Once selected, ensure the type is either a txt, pdf or document file before undisabling a 'send button' beneath the initial file upload button. The selected filename should also be displayed."

## Commit 3 - "A file should be sent to backend where the AWS OCR service for text extraction"

- Prompt "Create a 'Document' module in the backend along with it's own tests, dto, controller and service for receiving sent files from the frontend."
  Nest CLI [documentation](https://docs.nestjs.com/cli/usages_) states a command for generating a controller, module and service individually. I utilised Codex to create the Document module (later renamed to Documents).

- Prompt 'Fix dependency vulnerabilities'
  This one was intended to reduce the time taken to go through each vulnerability. `npm audit` was first used to identify the vulnerabilities revealing 22 vulnerabilities (5 low, 10 moderate, 7 high) which initially could only be fixed through `npm audit fix --force`. The vulnerabilities appeared to stem from @nestjs packages which led to an outdated version currently in use (v9). Instead of manually correcting, the prompt was run and was authorised to perform package changes including the update to v11 which resolved most cases.

## Commit 4 - "Text output must then be sent to AWS Polly (Eleven Labs?) for processing"

## Commit 5 - "Audio file to be sent back to the user"

## Commit 6 - "The file can either be played or downloaded by the user"

Prompt - "Create a dialog for error messages within the ErrorModal.tsx file"
