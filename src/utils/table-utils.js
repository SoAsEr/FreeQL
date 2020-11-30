import CSVParse from "csv-parse"

const textToTable=(text) => {
  return new Promise(resolve => CSVParse(text, {  relax_column_count: true }, (err, result) => {resolve(result, err)}));
}

export default textToTable;