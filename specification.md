# web page classifier

## what it does

The user will enter a URL into a web page interface written as a next.js app. When submitted the code will retrieve the page at the URL and analyze it via a call to a LLM in order to classify it into a topic.

## how it works

The web url will be accepted and will automatically prepend https:// in front of it if a full url string is not provided.

The data retrieved will be submitted to an api call to novita.ai with the prompting to classify the content of submitted page. The additional prompts will instruct the LLM to not follow links, and return both the classification, the confidence of the classification, and a three item list of the factors used to make the determination.

The next.js app will then display this information in a visually pleasing user interface.