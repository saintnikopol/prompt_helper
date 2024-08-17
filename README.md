# Prompt Helper Library

When working with any LLM (Large Language Model) or an LLM chat, you often want to provide the current state of your codebase. This library allows you to push the content of the target directory into stdout.

For example, the command:

   `pcs src > src.txt`

will put all the code into a single file. This works well for small projects. The context window for most chat interfaces is limited to 32k tokens, which translates to around 10k lines of code.

Using the Gradio chat interface allows you to use the API and access longer context windows—128k or up to 2M tokens, depending on the target LLM API.

## Example:

   `pcs . > currentProject.txt`

Pushes the content of the current directory (".") into a file named currentProject.txt.

Directories like node_modules, dist, and others will be omitted.

## Installation:

Add these lines to your .zshrc or .bash_profile:

```
alias pc='node <path_to_lib>/prompt_helper/content.lister.js'
alias pcs='node <path_to_lib>/prompt_helper/content.lister.sanitized.js'
```

Then you can use it from the command line as pc or pcs.

## Two Modes: raw and filtered

   - `raw` mode (`content.lister.js`): Compresses the whole content into a single file.
   - `filtered` mode (`content.lister.sanitized.js`): Replaces all literals that are present in the file passwords.txt with literals like __passwordhidden${i}__.

Using filtered mode is recommended for regular use, especially for codebases where passwords and tokens are present in .env files or other locations.
