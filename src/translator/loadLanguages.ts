import fs from 'fs';
import csvParse from 'csv-parse';

interface Request {
    en: string;
    pt: string;
}

// const = LoadLanguages {
//     async execute(): Promise<any> {
const loadLanguages = async () => {
    const languageReadStream = fs.createReadStream('./language.csv');

    const languages: Request[] = [];
    const parsers = csvParse({
      from_line: 2,
    })

    const parseCSV = languageReadStream.pipe(parsers);

    parseCSV.on('lng', async line => {
      const [en, pt] = line.map((cell: string) => 
          cell.trim(),
      );

      languages.push({ en, pt })
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

}

export default loadLanguages;