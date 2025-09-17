function testAnalyzeHandFallback() {
  const response = HandlerAnalyzeHand.handle({ handNumber: 'HAND9999' });
  console.log(JSON.stringify(response.getContent ? JSON.parse(response.getContent()) : response));
}
