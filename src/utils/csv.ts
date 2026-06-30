export function parseCsv(input: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => item.length > 0) || input.endsWith(delimiter)) rows.push(row);
  return rows;
}

export function csvRowsToObjects(rows: string[][]) {
  const [headers = [], ...body] = rows;
  return body.map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header || `column_${index + 1}`] = row[index] ?? '';
      return record;
    }, {}),
  );
}
