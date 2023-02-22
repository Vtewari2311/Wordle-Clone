import { wordlist } from './wordlist-english';
import { evaluate, evaluateLetter, isWord, LetterClass, randomWord } from './wordl';
import { isTabbable } from '@chakra-ui/utils';

describe('isWord tests', () => {
    let savedWords : Array<string> = [];
    beforeEach(() => {
        savedWords = wordlist['english'];
        wordlist['english'] = ['hello', 'John', 'Boyland', 'from', 'your', 'jesttest'].sort();
    });
    afterEach(() => {
        wordlist['english'] = savedWords;
    })
    it('find a word #1', () => {
        expect(isWord('jesttest')).toBe(true);
    });
    it('find a word #2', () => {
        expect(isWord('HELLO')).toBe(true);
    });
    it('find a word #3', () => {
        expect(isWord('Your')).toBe(true);
    });
    it('find a word #4', () => {
        expect(isWord('frOM')).toBe(true);
    });
    it('find american word', () => {
        expect(isWord('snivelers')).toBe(true);
    })

    it('not find a non-word #1', () => {
        expect(isWord('word')).toBe(false);
    })
    it('not find a non-word #2', () => {
        expect(isWord('John')).toBe(false);
    })
});

describe('random word tests', () => {
    test('random word length 21', () => {
        expect(['ELECTROENCEPHALOGRAPH','ELECTROENCEPHALOGRAMS']).toContain(randomWord(21));
    });
    test('random word length 22', () => {
        expect(['ELECTROENCEPHALOGRAPHS','COUNTERREVOLUTIONARIES']).toContain(randomWord(22));
    });
    test('random word length 23', () => {
        expect(() => randomWord(23)).toThrowError();
    });
});

describe('deterministic random word tests', () => {
    const savedLists : Array<Array<string>> = [];
    function replaceList(n : number, a : string[]) {
        savedLists[n] = wordlist['english/' + n];
        wordlist['english/' + n] = a;
    }
    function restoreLists() {
        savedLists.forEach((a,i) => {
            wordlist['english/' + i] = a;
        })
    }
    beforeEach(() => {
        replaceList(10, ["OK"]);
        replaceList(20, ["x", "Bar"]);
        replaceList(35, ["four", "Five"]);
        replaceList(40, ["", "forty"]);
        replaceList(50, ["foo"]);
    });
    afterEach(() => {
        restoreLists();
    });

    test('det test #0', () => {
        expect(randomWord(0)).toBe("");
    });
    test('det test #1', () => {
        expect(randomWord(1)).toBe("X");
    });
    test('det test #2', () => {
        expect(() => randomWord(2)).toThrowError();
    });
    test('det test #3', () => {
        expect(randomWord(3)).toBe("FOO");
    });
    test('det test #4', () => {
        expect(randomWord(4)).toBe('FOUR');
    })
 })

 describe('evaluate tests', () => {
    test('evaluate A:0 in BRAVE', () => {
        expect(evaluate('A',0,"BRAVE")).toBe(LetterClass.Misplaced);
    });
    test('evaluate B:0 in BRAVE', () => {
        expect(evaluate('B',0,"BRAVE")).toBe(LetterClass.Located);
    });
    test('evaluate C:0 in BRAVE', () => {
        expect(evaluate('C',0,"BRAVE")).toBe(LetterClass.NotPresent);
    });
    test('evaluate D:2 in DADDY', () => {
        expect(evaluate('D',2,"DADDY")).toBe(LetterClass.Located);
    });
    test('evaluate E:3 in EAGLE', () => {
        expect(evaluate('E',3,"EAGLE")).toBe(LetterClass.Misplaced);
    });
    test('evaluate F:4 in SHEAF', () => {
        expect(evaluate('F',4,"SHEAF")).toBe(LetterClass.Located);
    });
    test('evaluate G:5 in GROGG', () => {
        expect(evaluate('G',5,"GROGG")).toBe(LetterClass.Misplaced);
    });
    test('evaluate H:5 in SLEIGHT', () => {
        expect(evaluate('H',5,"SLEIGHT")).toBe(LetterClass.Located);
    });
    test('evaluate I:4 in TEAM', () => {
        expect(evaluate('I',4,"TEAM")).toBe(LetterClass.NotPresent);
    });
    test('evaluate J:-1 in APPLEJUICE', () => {
        expect(evaluate('J',-1,"APPLEJUICE")).toBe(LetterClass.Misplaced);
    });
 });

 describe('evaluateLetter tests', () => {
    describe('no attempts', () => {
        test('not in word', () => {
            expect(evaluateLetter("A","SMILE",[])).toBe(LetterClass.Unevaluated);
        });
        test('in word', () => {
            expect(evaluateLetter("E","SMILE",[])).toBe(LetterClass.Unevaluated);
        });
    });

    describe('one attempt', () => {
        const attempts = ["LEVEE"];
        test('not in word or attempt', () => {
            expect(evaluateLetter("D","CAMEL",attempts)).toBe(LetterClass.Unevaluated);
        });
        test('in word but not in attempt', () => {
            expect(evaluateLetter("C","CAMEL",attempts)).toBe(LetterClass.Unevaluated);
        });
        test('not in word, but in attempt', () => {
            expect(evaluateLetter("V","CAMEL",attempts)).toBe(LetterClass.NotPresent);
        });
        test('in word and attempt #1', () => {
            expect(evaluateLetter("L","CAMEL",attempts)).toBe(LetterClass.Misplaced);
        });
        test('in word and attempt #2', () => {
            expect(evaluateLetter("E","CAMEL",attempts)).toBe(LetterClass.Located);
        });
    });

    describe('many attempts', () => {
        const attempts = ["SQUID", "PRISM", "LEVEL"];
        test('not in word or attempt', () => {
            expect(evaluateLetter("C","SMILE",attempts)).toBe(LetterClass.Unevaluated);
        });
        test('in word but not in attempt', () => {
            expect(evaluateLetter("O","MOLES",attempts)).toBe(LetterClass.Unevaluated);
        });
        test('not in word, but in attempt', () => {
            expect(evaluateLetter("V","SMILE",attempts)).toBe(LetterClass.NotPresent);
        });
        test('in word and attempt #1', () => {
            expect(evaluateLetter("S","SMILE",attempts)).toBe(LetterClass.Located);
        });
        test('in word and attempt #2', () => {
            expect(evaluateLetter("M","SMILE",attempts)).toBe(LetterClass.Misplaced);
        });
        test('in word and attempt #3', () => {
            expect(evaluateLetter("I","SMILE",attempts)).toBe(LetterClass.Located);
        });
        test('in word and attempt #4', () => {
            expect(evaluateLetter("L","SMILE",attempts)).toBe(LetterClass.Misplaced);
        });
        test('in word and attempt #5', () => {
            expect(evaluateLetter("E","SMILE",attempts)).toBe(LetterClass.Misplaced);
        });

    })
 })