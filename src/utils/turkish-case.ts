export const turkishToUpper = (str: string): string => {
  return str
    .replace(/i/g, 'İ')
    .replace(/ı/g, 'I')
    .toUpperCase();
};

export const turkishToLower = (str: string): string => {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase();
};

export const turkishTitleCase = (str: string): string => {
  return str.split(' ').map(word => {
    if (word.length === 0) return '';
    const firstChar = word.charAt(0);
    const rest = word.slice(1);
    
    let upperFirst;
    if (firstChar === 'i') upperFirst = 'İ';
    else if (firstChar === 'ı') upperFirst = 'I';
    else upperFirst = firstChar.toUpperCase();
    
    return upperFirst + turkishToLower(rest);
  }).join(' ');
};
