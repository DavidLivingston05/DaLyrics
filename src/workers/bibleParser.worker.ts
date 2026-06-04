import { parseBibleXMLFast } from '../lib/xmlParser';

self.onmessage = (e: MessageEvent<{ type: string; xmlString: string }>) => {
  if (e.data.type === 'parse') {
    try {
      const result = parseBibleXMLFast(e.data.xmlString, (progress) => {
        self.postMessage({ type: 'progress', progress });
      });
      self.postMessage({ type: 'result', verses: result });
    } catch (err: any) {
      self.postMessage({ type: 'error', error: err.message || 'Unknown error parsing XML' });
    }
  }
};
