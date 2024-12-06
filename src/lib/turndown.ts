import TurndownService from 'turndown';

export const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
  bulletListMarker: '-',
  linkStyle: 'inlined',
});

// Remove link tags
turndown.addRule("linkRemover", {
  filter: "a",
  replacement: (content: any) => content,
});

// Remove style tags
turndown.addRule('styleRemover', {
  filter: 'style',
  replacement: () => '',
});

// Remove script tags
turndown.addRule('scriptRemover', {
  filter: 'script',
  replacement: () => '',
});

turndown.addRule("imageRemover", {
  filter: "img",
  replacement: (content: any) => content,
});