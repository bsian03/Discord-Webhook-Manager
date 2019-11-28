const EventEmitter = require('events');
const request = require('request-promise');

/**
 * Discord Webhook Manager
 * @author Bsian <bsian@staff.libraryofcode.org>
 * @note Initialise a new instance of the Webhook Manager for each webhook
 */
class WebhookManager extends EventEmitter {
  /**
   * Settings for Webhook Manager
   * @param {string} webhookID Webhook ID
   * @param {string} webhookToken Webhook Token
   * @param {{content?: string, embeds?: {}[]}} format Format which the webhook should be sent in - use `'text'` as the wildcard phrase for where the logs should be placed.
   * Default:
   * ```js
   * { content: 'text' }
   * ```
   * @param {number} interval Interval at which the webhooks should be sent at in milliseconds. Default: 2000
   * @param {number} joinInputLengths Maximum length of joined messages - if you don't want them joined, select 0. Default: 0
   */
  constructor(webhookID, webhookToken, format = { content: 'text' }, interval = 2000, joinInputLengths = 0) {
    super();
    if (!webhookID || !webhookToken) throw new TypeError('Expected Webhook ID and Webhook T/*  */oken');
    if (interval < 0 || joinInputLengths < 0) throw new TypeError('`interval` and `joinInputLengths` parameter must be greater than or equal to 0');
    this.url = `https://discordapp.com/api/webhooks/${webhookID}/${webhookToken}`;
    this.format = format;
    this.interval = interval;
    this.joinInputLengths = joinInputLengths;
    /**
     * @type {string[]} Array of messages
     */
    this.queue = [];
    /**
     * @type {Date[]}
     */
    this.rateLimiter = [];
    this.enabled = true;

    setInterval(() => { this.rateLimiter = this.rateLimiter.filter((d) => new Date(Date.now() - 2000) < d); });

    setInterval(async () => {
      if (this.rateLimiter.length >= 30 || !this.queue.length) return;
      const body = JSON.parse(JSON.stringify(this.format).replace(/text/g, this.queue[0].replace(/"/g, '\\"')));
      try {
        await request({
          method: 'POST', uri: this.url, body, json: true, resolveWithFullResponse: true,
        });
        this.queue.shift();
      } catch (error) {
        if (error.statusCode !== 429 && error.statusCode !== 500) this.rateLimiter.push(new Date());
        let errorMessage = `${error.response.statusCode} ${error.response.statusMessage}: ${error.error.code || error.statusCode} - ${error.error.message}`;
        if (error.statusCode === 429) errorMessage += '\nRate limits are not working, please open an issue at https://gitlab.libraryofcode.org/engineering/webhook-manager';
        else if (error.statusCode === 401
          || error.statusCode === 403
          || error.statusCode === 404) {
          errorMessage += '\nPlease try again with another webhook'
          + '\nFor more info regarding webhooks, please see https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks';
        }
        this.emit('error', [errorMessage, error]);
        return;
      }
      this.rateLimiter.push(new Date());
    }, this.interval);
  }

  /**
   * Add a message to the queue
   * @param {string} message Message to be added
   * @returns {string[]} Current queue
   */
  addToQueue(message) {
    if (!this.joinInputLengths) {
      const splitMessages = this.splitString(message);
      splitMessages.forEach((m) => this.queue.push(m));
    } else {
      const splitMessages = message.split('\n');
      splitMessages.forEach((m) => {
        const lastInQueue = this.queue[this.queue.length - 1];
        if (!lastInQueue || lastInQueue.length + m.length > this.joinInputLengths) this.queue.push(m);
        else this.queue[this.queue.length - 1] += `\n${m}`;
      });
    }
    return this.queue;
  }

  /**
   * Removes everything in the queue
   * @returns {string[]} Empty queue
   */
  emptyQueue() {
    this.queue = [];
    return this.queue;
  }

  /**
   * Resets the rate limit
   * @returns {Date[]} Empty rate limit
   */
  resetRateLimit() {
    this.rateLimiter = [];
    return this.rateLimiter;
  }

  /**
   * Updates the webhook URL
   * @param {string} webhookID New Webhook ID
   * @param {string} webhookToken New Webhook Token
   * @returns {string} New Webhook URL
   */
  updateWebhook(webhookID, webhookToken) {
    this.url = `https://discordapp.com/api/webhooks/${webhookID}/${webhookToken}`;
    return this.url;
  }

  /**
   * Pause webhook sending
   * @returns {boolean} Enabled status
   */
  pauseWebhookSending() {
    this.enabled = false;
    return this.enabled;
  }

  /**
   * Start/resume webhook sending
   * @returns {boolean} Enabled status
   */
  startWebhookSending() {
    this.enabled = true;
    return this.enabled;
  }

  /**
   * End webhook sending and clear the queue
   * @returns {boolean} Enabled status
   */
  stopWebhookSending() {
    this.enabled = false;
    this.queue = [];
    return this.enabled;
  }

  /**
   * Split a message
   * @param {string} message Message to be split
   * @private
   */
  splitString(message) {
    const msgArray = [];
    let str = '';
    let pos = 0;
    const maxLength = this.joinInputLengths || 2000;
    while (message.length > 0) {
      pos = message.length > maxLength ? message.lastIndexOf('\n', maxLength) : message.length;
      if (pos > maxLength) pos = maxLength;
      str = message.substring(0, pos);
      // eslint-disable-next-line no-param-reassign
      message = message.substring(pos);
      msgArray.push(str);
    }
    return msgArray;
  }
}

module.exports = WebhookManager;
