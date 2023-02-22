import { wordlist } from './wordlist-english';

export enum LetterClass {
    Unevaluated,
    NotPresent,
    Misplaced,
    Located
}

const allDialects = ['english', 'english/british', 'english/american', 'english/canadian'];
const dialects = ['english']; // for choosing the secret word
const freqChoices = [10,20,35,40,50];

export function throwError() {
    throw new Error('Something went wrong');
}
/**
 * Return a random english word with the given length.
 * We choose a word with commonality at most '50',
 * and though we require that the word be in the dictionary in
 * lowercase, we return the word in uppercase.
 * @param length 
 * @returns a random english word of the given length
 */
export function randomWord(length : number) : string {
    let s : string = " ";
    // Iterate over Dialects
    // Narrow search to english
    // Narrow search based on frequency
    // Compare length
    // return
    let total = 0;
    let possible = 0;
    dialects.forEach((d) => freqChoices.forEach((f) => {
        total += wordlist[d + '/' + f].length;
        possible += wordlist[d + '/' + f].reduce((count, word) =>
            count + ((word.length === length && word.toLowerCase() === word) ? 1 : 0)
            , 0);
    }));
    if(possible === 0) throw new Error('no words of this length: ' + length);
    let result : string | null = null;
    while(result === null) {
        let choice = Math.floor(Math.random() * total);
        for(let d of dialects) {
            for(let f of freqChoices) {
                if(choice >= 0) {
                    const array = wordlist[d + '/' + f];
                    if(choice < array.length) {
                        const word = array[choice];
                        if(word.length === length && word.toLowerCase() === word) {
                            result = word;
                        }
                    }
                    choice -= array.length;
                }
            }
        }
    }
    return result.toUpperCase();
}
/**
 * Return whether the word is a lowercase word in the dictionary for any of the
 * dielects supported: standard, British, American or Canadian.
 * @param test word to check
 * @returns true word is accepted by one of our dialects
 */
export function isWord(test : string) : boolean {
    // TODO
    var flag = false;
    test = test.toLowerCase();
    for(const dialect of allDialects) {
        if(wordlist[dialect].indexOf(test) >= 0) flag = true;
    }
    return flag;
}

/**
 * Compute the classification for this letter in the given position
 * @param letter a single capitalized letter
 * @param position position within the guess (0-based)
 * @param key target word
 * @returns classification of this letter at this position
 */
export function evaluate(letter : string, position : number, key : string) : LetterClass {
    const len = key.length;
    var res : LetterClass = LetterClass.Unevaluated;
    if(position >= 0 && position < len && key[position] === letter) {
        res = LetterClass.Located;
    }
    for(let i = 0; i < len; ++i) {
        if(key[i] === letter) res = LetterClass.Misplaced;
    }

    return res;
}

/**
 * Evaluate the classification of a letter given all guesses.
 * @param letter a single character
 * @param key the target word
 * @param attempts all previous attempts
 * @returns classification of this letter
 */
export function evaluateLetter(letter : string, key : string, attempts: string []) : LetterClass {
    // no attempts
    let result = LetterClass.Unevaluated;
    attempts.forEach((w) => {
        w.split(' ').forEach((l, j) => {
            if(l === letter) {
                const r = evaluate(letter, j, key);
                if(r > result) result = r;
            }
        });
    });
    return result;
}
