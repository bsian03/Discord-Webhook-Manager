import { EventEmitter } from "events";

interface DiscordEmbed {
  title?: string
  description?: string
  url?: string
  timestamp?: Date
  color: number
  footer?: { text: string, icon_url?: string }
  image?: { url: string, height?: number, width?: number }
  thumbnail?: { url: string, height?: number, width?: number }
  author?: { name: string, url?: string, icon_url: string }
  fields?: { name: string, value: string, inline?: boolean }[]
}

interface DiscordMessage {
  content?: string
  embeds?: DiscordEmbed
}

declare class WebhookManager extends EventEmitter {
  constructor(webhookID: string, webhookToken: string, format?: DiscordMessage, interval?: number, joinInputLengths?: number)
  /**
   * Add a message to the queue
   * @param message Message to be added
   * @returns Current queue
   */
  addToQueue(message: string): string[]
  /**
   * Removes everything in the queue
   * @returns Empty queue
   */
  emptyQueue(): string[]
  /**
   * Resets the rate limit
   * @returns Empty rate limit
   */
  resetRateLimit(): Date[]
  /**
   * Updates the webhook URL
   * @param webhookID New Webhook ID
   * @param webhookToken New Webhook Token
   * @returns New Webhook URL
   */
  updateWebhook(webhookID: string, webhookToken: string): string
  /**
   * Pause webhook sending
   * @returns Enabled status
   */
  pauseWebhookSending(): false
  /**
   * Start/resume webhook sending
   * @returns Enabled status
   */
  startWebhookSending(): true
  /**
   * End webhook sending and clear the queue
   * @returns Enabled status
   */
  stopWebhookSending(): false
}

export default WebhookManager