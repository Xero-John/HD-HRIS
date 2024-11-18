/**
 * Pluralizes a base word based on the given count, handling common and irregular pluralization rules.
 *
 * @param n - The count of items.
 * @param baseWord - The base word to pluralize.
 * @returns The singular or plural form of the word based on the count.
 */
export const pluralize = (n: number, baseWord: string): string => {
    if (n === 1) return baseWord;

    // Handle words ending in "f" or "fe" (e.g., "knife" -> "knives", "wolf" -> "wolves")
    if (baseWord.endsWith("f")) {
        return baseWord.slice(0, -1) + "ves";
    }
    if (baseWord.endsWith("fe")) {
        return baseWord.slice(0, -2) + "ves";
    }

    // Handle words ending in "y" (e.g., "city" -> "cities")
    if (baseWord.endsWith("y") && !/[aeiou]y$/.test(baseWord)) {
        return baseWord.slice(0, -1) + "ies";
    }

    // Handle words ending in "s", "x", "z", "ch", or "sh" (e.g., "box" -> "boxes")
    if (/(s|x|z|ch|sh)$/.test(baseWord)) {
        return baseWord + "es";
    }

    // Default case: add "s"
    return baseWord + "s";
};