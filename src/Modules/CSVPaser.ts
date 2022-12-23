import { parse, ParseConfig, ParseResult, LocalFile } from 'papaparse';
export type UnheadedCSV = number[];

const csvParser = (option: ParseConfig) => (blob: LocalFile) =>
  new Promise<ParseResult<UnheadedCSV>>((complete, error) => {
    parse<UnheadedCSV>(blob, { ...option, complete, error });
  });

export const parseCsvData = csvParser({
  skipEmptyLines: true,
  dynamicTyping: true,
});
