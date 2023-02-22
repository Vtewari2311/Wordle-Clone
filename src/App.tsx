import { Button, Flex, HStack, Table, TableContainer, Tbody, Td, Tr, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import './App.css';
import { LetterClass, evaluate, evaluateLetter, randomWord, isWord } from './wordl';

const CORRECT = 'green';
const INCORRECT = 'blackAlpha';
const EMPTY = 'white';
const MISPLACED = 'yellow';

const praise = ["Genius", "Unbelievable", "Impressive",
  "Splendid", "Good work", "Phew"];


interface LProps {
  background: string;
  children?: React.ReactNode;
}

function L(props: LProps) {
  const bg = {
    'white': '#fff',
    'yellow': '#ffdd00',
    'green': '#22bb33',
    'blackAlpha': 'rgba(0, 0, 0, 0.3)',
  }[props.background];

  const textColor = bg === '#fff' ? '#000' : '#fff';

  return (
    <Flex
      width="62px"
      align="center"
      justify="center"
      bg={bg}
      color={textColor}
    >
      {props.children}
    </Flex>
  );
}


function range(a: number, b: number): number[] {
  const result: number[] = [];
  for (let i = a; i < b; i++) {
    result.push(i);
  }
  return result;
}


interface AppProps {
  wordLength?: number;
  numGuesses?: number;
}

const DEFAULT_LENGTH = 5;
const DEFAULT_GUESSES = 6;

function App(p: AppProps) {
  const wordLength = p.wordLength ?? DEFAULT_LENGTH;
  const numGuesses = p.numGuesses ?? DEFAULT_GUESSES;

  // use state and toast

  const [goal] = useState(randomWord(wordLength));
  const [tries, setTries] = useState(0);
  const [words, setWords] = useState(['']);

  const toast = useToast();

  // Many helpers

  function errorMessage(msg: string) {
    toast({
      title: 'Error',
      description: msg,
      status: 'error',
      isClosable: true,
    });
  }

  function asColor(c1: LetterClass) {
    const colorMap: Record<LetterClass, string> = {
      [LetterClass.Located]: CORRECT,
      [LetterClass.Misplaced]: MISPLACED,
      [LetterClass.NotPresent]: INCORRECT,
      [LetterClass.Unevaluated]: ''
    };
    return colorMap[c1] ?? EMPTY;
  }
  
  function makeRow(i: number) {
    if (i >= tries) {
      const word = words[i] ?? '';
      return (
        <Tr key={i}>
          {range(0, word.length).map(j => <Td key={j}><L background={''}>{word[j]}</L></Td>)}
          {range(word.length, wordLength).map((j) => <Td key={j}><L background={''}>/</L></Td>)}
        </Tr>
      )
    } else {
      const word = words[i];
      return (
        <Tr key={i}>
          {range(0, wordLength).map((j) => <Td key={j}><L background={asColor(evaluate(word[i], j, goal))}></L></Td>)}
        </Tr>
      );
    }
  }
  

  function handleBackspace() {
    const currentWordIndex = tries;
    const currentWord = words[currentWordIndex];
    const isCurrentWordEmpty = currentWord.length === 0;
  
    if (isCurrentWordEmpty || currentWordIndex === words.length) {
      errorMessage("Can't undo guess");
      return;
    }
  
    const newWords = [...words];
    newWords[currentWordIndex] = currentWord.slice(0, -1);
    setWords(newWords);
  }
  

  function handleEnter() {
    const word = words[tries];
    if (tries === numGuesses) {
      errorMessage('No more guesses');
    } else if (words.length === tries || word.length < wordLength) {
      errorMessage('Please finish your guess');
    } else if (!isWord(word)) {
      errorMessage(word + "is not in our dictionary");
    } else {
      console.log('testing word');
      const thisTry = tries;
      setTries(tries + 1);
      if (word === goal) {
        toast({
          description: praise[thisTry],
          status: 'success'
        });
      } else if (thisTry === numGuesses - 1) {
        toast({
          description: 'Oh well. Better luck next time',
          status: 'info'
        });
      }
    }
  }

  function handleKey(key: string) {
    const ukey = key.toUpperCase();
    if (ukey >= 'A' && ukey <= 'Z') {
      const word = words[tries] ?? ' ';
      if (tries === numGuesses) {
        errorMessage('No more guesses');
      } else if (word.length === wordLength) {
        errorMessage('Word is long enough. Use backspace to erase last character.');
      } else {
        setWords(words.slice(0, tries).concat([word + ukey]));
      }
    } else {
      errorMessage('Press a letter');
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    console.log('key pressed is', e.key);
    console.log('goal is ', goal);
    if (e.key.length > 1) {
      switch (e.key) {
        case 'Backspace': handleBackspace();
          break;
        case 'Enter': handleEnter();
          break;
        case 'Shift':
        case 'Control':
        case 'Option':
        case 'Meta':
        case 'Alt':
          /* ignore */
          break;
        default:
          errorMessage('No action for ' + e.key);
          break;
      }
    } else {
      handleKey(e.key);
    }
  }

  function keyButton(key: string) {
    let bg = asColor(evaluateLetter(key, goal, words.slice(0, tries)))
    if (bg === 'white') bg = 'gray';
    if (bg === MISPLACED) bg = 'yellow';
    if (bg === INCORRECT) bg = 'blackAlpha';
    function onClick() {
      handleKey(key);
    }
    return <Button key={key} onClick={onClick} variant='solid' width='44px' height='62px' colorScheme={key}>
    </Button>
  }

  return (
    <div data-testid="top-level" onKeyDown={onKeyDown} tabIndex={-1} className="App">
      <header className="App-header">
        <h1>Wordl</h1>
      </header>
      <main>
        <TableContainer margin='auto' maxWidth={(70 * wordLength)+"px"}>
          <Table variant="unstyled" size="sm" className='table-tiny'>
            <Tbody>
              {range(0, numGuesses).map(i => makeRow(i))}
            </Tbody>
          </Table>
        </TableContainer>
        <VStack>
          <HStack>
            {"QWERTYUIOP".split(' ').map(keyButton)}
          </HStack>
          <HStack>
            {"ASDFGHJKL".split(' ').map(keyButton)}
          </HStack>
          <HStack>
            <Button variant='solid' height='62px' colorScheme='gray' onClick={handleEnter}>
              Enter
            </Button>
            {"AXCVBNM".split(' ').map(keyButton)}
            <Button variant='solid' height='62px' colorScheme='gray' fontSize='32px' onClick={handleEnter}>
              &#9003;
            </Button>
          </HStack>
        </VStack>
      </main>
    </div>
  );
}

export default App;