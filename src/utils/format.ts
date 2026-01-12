export const formatNumber = (num: number): string => {
    if (num < 1000) return Math.floor(num).toString();

    const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const suffixNum = Math.floor((Math.floor(num).toString().length - 1) / 3);

    if (suffixNum >= suffixes.length) return "∞";

    let shortValue = parseFloat((num / Math.pow(1000, suffixNum)).toPrecision(3));
    if (shortValue % 1 !== 0) {
        shortValue = parseFloat(shortValue.toFixed(2));
    }
    return shortValue + suffixes[suffixNum];
};
