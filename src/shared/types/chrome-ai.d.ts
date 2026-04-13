// Chrome built-in AI Translation API (Chrome 131+)
// https://developer.chrome.com/docs/ai/translator-api

interface AITranslator {
  translate(text: string): Promise<string>;
  destroy(): void;
}

interface AITranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  monitor?: (monitor: EventTarget) => void;
}

interface AITranslatorFactory {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<
    'readily' | 'after-download' | 'no'
  >;
  create(options: AITranslatorCreateOptions): Promise<AITranslator>;
}

interface WindowAI {
  translator?: AITranslatorFactory;
}

interface Window {
  ai?: WindowAI;
}
