//https://regex101.com/r/YcvqjD/3
const supsubregex =
  /(?<WordMatcher>.*?[^0-9\-[(,:\s](?=[0-9+\-)\]/,:.\s]|$))(?<SubMatcher>(?:[)\]]?[0-9]+)+)?(?<SupMatcher>(?<ChargeSign>[+-])(?=[0-9]*(?:[/,:.\s]|[([][0-9]+[)\]]|$))(?:(?<ChargeValue>[0-9]+))?)?(?:(?<EndMatcher>[\s]+)|(?<EndBlockMatcher>[,:./\-)\]])|$)?/g;
const subregex = /([)\]])?([0-9]+)/g;
const wordRegex =
  /(?:[([A-Z]*?(?:[A-Z][a-z](?![a-z])|(?:OH|SCN|CN|SO|PO|CO|HCO|NTA|EDTA|EGTA|DTPA)))-?|.+?(?:-|$)/g;
export { supsubregex, subregex, wordRegex };
