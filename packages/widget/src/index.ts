import type { InstaFixConfig, InstaFixInstance } from "@instafix/core";
import { launch } from "./launcher.js";

export type {
  AnchorData,
  AnnotationPayload,
  AnnotationResponse,
  FeedbackPayload,
  FeedbackResponse,
  FeedbackStatus,
  FeedbackType,
  InstaFixConfig,
  InstaFixHeadersOption,
  InstaFixHttpConfig,
  InstaFixInstance,
  InstaFixLocale,
  InstaFixPublicEvents,
  InstaFixStore,
  InstaFixStoreConfig,
  RectData,
} from "@instafix/core";
export type { TFunction, TranslationKey, Translations } from "./i18n/index.js";
export { loadLocale, registerLocale } from "./i18n/index.js";
export type { Identity } from "./identity.js";

/**
 * Initialize the InstaFix feedback widget.
 *
 * @example
 * ```ts
 * import { initInstaFix } from '@instafix/widget'
 *
 * const { destroy } = initInstaFix({
 *   endpoint: '/api/instafix',
 *   projectName: 'my-project',
 * })
 * ```
 */
export function initInstaFix(config: InstaFixConfig): InstaFixInstance {
  return launch(config);
}
