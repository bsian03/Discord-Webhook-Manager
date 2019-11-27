# Webhook Manager
A Discord Webhook Manager for Node.JS - Easily customisable webhook settings with webhook rate limits and let the manager send the webhooks for you!

## Installation
Node 8+ is required for the webhook manager to work. Previous versions of Node.JS may work, however they will not be supported.
To install, run this in your project folder:
### NPM
```
npm i discord-webhook-manager
```
### Yarn
```
yarn add discord-webhook-manager
```
### Bower
```
bower install discord-webhook-manager
```

## Usage
```js
const WebhookManager = require('discord-webhook-manager');

const webhook1 = new WebhookManager(webhookID, webhookToken[, format[, interval[, joinInputLengths]]]);
webhook1.addToQueue('Message goes here')
```
`webhookID`: string - Webhook ID

`webhookToken`: string - Webhook Token

`format`: object (optional) - The way the webhook should be sent, this should be in the [Discord webhook format](https://discordapp.com/developers/docs/resources/webhook#execute-webhook). Use `'text'` as a placeholder for adding messages to the queue.  Default:
```js
{
  content: 'text'
}
```

`interval`: number (optional) - Interval at which webhooks should be sent at in milliseconds, e.g. `5000` would be 5 seconds. Default: `2000`

`joinInputLengths`: number (optional) - Maximum character count of joined messages (especially useful for logs). If you don't want them joined, leave at `0`. Default: `0`

## Properties/Functions
### WebhookManager.url
`webhook1.url`: string - URL of selected Webhook
### WebhookManager.format
`webhook1.format`: object - Format of webhook message as set in `format` parameter
### WebhookManager.interval
`webhook1.interval`: number - Interval at which webhooks are sent in milliseconds
### WebhookManager.joinInputLengths
`webhook1.joinInputLengths`: number - Maximum length of joined messages, or no joined messages if `0`
### WebhookManager.queue
`webhook1.queue`: string[] - Array of messages in the queue
### WebhookManager.rateLimiter
`webhook1.rateLimiter`: Date[] - Array of ISO8601 timestamps of sent webhooks, used for rate limiting webhook requests
### WebhookManager.enabled
`webhook1.enabled`: boolean - Whether the webhook is running or not
### WebhookManager.addToQueue(message: string)
`webhook1.addToQueue('Message here')`: string[] - Adds a message to the queue. Returns the queue
### WebhookManager.emptyQueue()
`webhook1.emptyQueue()`: string[] - Removes everything in the queue. Returns the empty queue
### WebhookManager.resetRateLimit()
`webhook1.resetRateLimit()`: Date[] - Resets the rate limit. Returns the empty rate limit
### WebhookManager.updateWebhook(webhookID: string, webhookToken: string)
`webhook1.updateWebhook('649305310778884106', 'TYCRyGQbze-UTFzlUgOmP6FgQK_0LnL5axCku06fTDr-CyI1VytbcDRveDl0frbA_PiM0')`: string - Updates the webhook URL. Returns the new Webhook URL (don't try using this, it doesn't exist)
### WebhookManager.pauseWebhookSending()
`webhook1.pauseWebhookSending()`: boolean - Pause webhook sending. Returns the enabled status
### WebhookManager.startWebhookSending()
`webhook1.startWebhookSending()`: boolean - Start/resume webhook sending. Returns the enabled status
### WebhookManager.stopWebhookSending()
`webhook1.stopWebhookSending()`: boolean - End webhook sending and clear the queue. Returns the enabled status

## Events
### error
Emits when an error occurs with the webhook sending
```js
webhook1.on('error', (errorMessage: string, error: Error) => {
  console.error(error)
  console.error(errorMessage)
  // Do something to resolve the error
});
```