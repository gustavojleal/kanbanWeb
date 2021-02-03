interface Response {
    'languageId': string,
    'fileLocate': string,
}

export default function SetedLanguage() {
    
    const defaultLanguage = navigator.language;

    const languanges = [
        { title: 'pt-BR', filePath: './locales/pt_BR.json'},
        { title: 'en-CA', filePath: './locales/en_US.json'},
        { title: 'fr-CA', filePath: './locales/fr_CA.json'},
    ];

    const setedLanguage = languanges.find((languange, title) => {
        if (languange.title === defaultLanguage) return languange.filePath
        return null
    })


    const filePath  = (!setedLanguage ? './locales/en_US.json' : setedLanguage.filePath);

    return ( filePath )
}