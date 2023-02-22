import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { randomWord, isWord } from './wordl';
import { UseToastOptions } from '@chakra-ui/react';

const mockToast = jest.fn();

async function sleep(millis : number) : Promise<void> {
  return new Promise((resolve,error) => setTimeout(() => resolve(), millis));
}

jest.mock('./wordl', () =>{
  const actual = jest.requireActual('./wordl');
  return {
    ... actual,
    randomWord: jest.fn((x : number) => "SMILE"),
    isWord: jest.fn(actual.isWord),
  }
});

const mockRandomWord = randomWord as jest.Mock; 
const mockIsWord = isWord as jest.Mock;

jest.mock("@chakra-ui/react", () => {
  const ui = jest.requireActual("@chakra-ui/react");
  return {
    ... ui,
    useToast: ()=>(mockToast),
  };
})


test('mock random word works', () => {
  // This test was failing because react scripts defaulted mockReset
  // whgich breaks mocking import
  expect(isWord("SMILE")).toBe(true);
  expect(isWord("SMILX")).toBe(false);
  expect(randomWord(5)).toBe("SMILE");
});

test('renders wordl header', () => {
  const renderData = render(<App />);
  const linkElement = screen.getByText(/Wordl/i);
  expect(linkElement).toBeInTheDocument();
  renderData.unmount();
});

describe('test interaction', () => {
  let user;
  let onKey = (x:React.KeyboardEvent) => {};
  beforeEach(async () => {
    mockRandomWord.mockClear();
    mockIsWord.mockClear();
    mockToast.mockClear();
    const renderData = render(<App />);
    await waitFor(() => expect(mockRandomWord).toBeCalled());
    await waitFor(() => { renderData.findAllByTestId("top-level") } );
  });

  test('top-level defined', () => {
    const outerDivElement = screen.getByTestId("top-level");
    expect(outerDivElement).toBeInTheDocument();
    expect(mockRandomWord).toBeCalledTimes(1);
    expect(mockRandomWord).toHaveReturnedWith("SMILE");
  });

  test('letter buttons defined', () => {
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("X").className.indexOf("button")).toBeGreaterThan(-1);
  });

  test('special buttons defined', () => {
    expect(screen.getByText("Enter")).toBeInTheDocument();
    expect(screen.getByText("Enter").className.indexOf("button")).toBeGreaterThan(-1);
    expect(screen.getByText("⌫")).toBeInTheDocument();
    expect(screen.getByText("⌫").className.indexOf("button")).toBeGreaterThan(-1);
  })

  test('accept answer', async () => {
    const outerDivElement = screen.getByTestId("top-level");
    fireEvent.keyDown(outerDivElement, {key : "s"});
    fireEvent.keyDown(outerDivElement, {key : "m"});
    fireEvent.keyDown(outerDivElement, {key : "i"});
    fireEvent.keyDown(outerDivElement, {key : "l"});
    fireEvent.keyDown(outerDivElement, {key : "e"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("SMILE");
    expect(mockToast).toBeCalledTimes(1);
    const args = mockToast.mock.calls[0];
    expect(args).toBeDefined();
    const arg = args[0] as UseToastOptions;
    expect(arg.status).toBe('success');
    expect(arg.description).toBe('Genius');
  });

  test('accept answer with clicks', async() => {
    fireEvent.click(screen.getByText("S"));
    fireEvent.click(screen.getByText("M"));
    fireEvent.click(screen.getByText("I"));
    fireEvent.click(screen.getByText("L"));
    fireEvent.click(screen.getByText("E"));
    fireEvent.click(screen.getByText("Enter"));
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("SMILE");
    expect(mockToast).toBeCalledTimes(1);
    const args = mockToast.mock.calls[0];
    expect(args).toBeDefined();
    const arg = args[0] as UseToastOptions;
    expect(arg.status).toBe('success');
  })

  test('permit correction', async() => {
    const outerDivElement = screen.getByTestId("top-level");
    fireEvent.keyDown(outerDivElement, {key : "S"});
    fireEvent.keyDown(outerDivElement, {key : "M"});
    fireEvent.keyDown(outerDivElement, {key : "I"});
    fireEvent.keyDown(outerDivElement, {key : "L"});
    fireEvent.keyDown(outerDivElement, {key : "X"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("SMILX");
    expect(mockToast).toBeCalledTimes(1);
    const args = mockToast.mock.calls[0];
    expect(args).toBeDefined();
    const arg = args[0] as UseToastOptions;
    expect(arg.status).toBe('error');

    mockToast.mockClear();
    mockIsWord.mockClear();
    fireEvent.keyDown(outerDivElement, {key : "Backspace"});
    fireEvent.keyDown(outerDivElement, {key : "E"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("SMILE");
    expect(mockToast).toBeCalledTimes(1);
    expect(mockToast.mock.calls).toBeDefined();
    const arg2 = mockToast.mock.calls[0][0] as UseToastOptions;
    expect(arg2.status).toBe('success');
    expect(arg2.description).toBe('Genius');
  });

  test('no backspace at start of line', async () => {
    fireEvent.click(screen.getByText("D"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("E"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("M"));
    fireEvent.click(screen.getByText("Enter"));
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("DREAM");

    fireEvent.click(screen.getByText("⌫"));
    await sleep(10);
    expect(mockToast).toBeCalledTimes(1);
    const args = mockToast.mock.calls[0];
    expect(args).toBeDefined();
    const arg = args[0] as UseToastOptions;
    expect(arg.status).toBe('error');

    mockToast.mockClear();

    const outerDivElement = screen.getByTestId("top-level");
    fireEvent.keyDown(outerDivElement, {key : "S"});
    fireEvent.keyDown(outerDivElement, {key : "M"});
    fireEvent.keyDown(outerDivElement, {key : "I"});
    fireEvent.keyDown(outerDivElement, {key : "L"});
    fireEvent.keyDown(outerDivElement, {key : "E"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);

    expect(mockIsWord).toBeCalledWith("SMILE");
    expect(mockToast).toBeCalledTimes(1);
    expect(mockToast.mock.calls).toBeDefined();
    const arg2 = mockToast.mock.calls[0][0] as UseToastOptions;
    expect(arg2.status).toBe('success');
    expect(arg2.description).toBe('Unbelievable');
  });

  test('used up all chances', async () => {
    fireEvent.click(screen.getByText("D"));
    fireEvent.click(screen.getByText("R"));
    fireEvent.click(screen.getByText("E"));
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("M"));
    fireEvent.click(screen.getByText("Enter"));
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("DREAM");
    mockIsWord.mockClear();
 
    fireEvent.click(screen.getByText("F"));
    fireEvent.click(screen.getByText("L"));
    fireEvent.click(screen.getByText("I"));
    fireEvent.click(screen.getByText("N"));
    fireEvent.click(screen.getByText("G"));
    fireEvent.click(screen.getByText("Enter"));
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("FLING");
    mockIsWord.mockClear();
  
    fireEvent.click(screen.getByText("S"));
    fireEvent.click(screen.getByText("O"));
    fireEvent.click(screen.getByText("U"));
    fireEvent.click(screen.getByText("T"));
    fireEvent.click(screen.getByText("H"));
    fireEvent.click(screen.getByText("Enter"));
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("SOUTH");
    mockIsWord.mockClear();
 
    const outerDivElement = screen.getByTestId("top-level");
    fireEvent.keyDown(outerDivElement, {key : "G"});
    fireEvent.keyDown(outerDivElement, {key : "L"});
    fireEvent.keyDown(outerDivElement, {key : "Y"});
    fireEvent.keyDown(outerDivElement, {key : "P"});
    fireEvent.keyDown(outerDivElement, {key : "H"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("GLYPH");
    mockIsWord.mockClear();

    fireEvent.keyDown(outerDivElement, {key : "c"});
    fireEvent.keyDown(outerDivElement, {key : "r"});
    fireEvent.keyDown(outerDivElement, {key : "u"});
    fireEvent.keyDown(outerDivElement, {key : "m"});
    fireEvent.keyDown(outerDivElement, {key : "b"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("CRUMB");
    mockIsWord.mockClear();

    expect(mockToast).not.toBeCalled();
 
    fireEvent.keyDown(outerDivElement, {key : "m"});
    fireEvent.keyDown(outerDivElement, {key : "i"});
    fireEvent.keyDown(outerDivElement, {key : "l"});
    fireEvent.keyDown(outerDivElement, {key : "e"});
    fireEvent.keyDown(outerDivElement, {key : "s"});
    fireEvent.keyDown(outerDivElement, {key : "Enter"});
    await sleep(10);
    expect(mockIsWord).toBeCalledWith("MILES");
    mockIsWord.mockClear();

    expect(mockToast).toBeCalledTimes(1);
    const args = mockToast.mock.calls[0];
    expect(args).toBeDefined();
    const arg = args[0] as UseToastOptions;
    expect(arg.status).toBe('info');
    mockToast.mockClear();

    fireEvent.keyDown(outerDivElement, {key : "s"});
    expect(mockToast).toBeCalledTimes(1);
    expect(mockToast.mock.calls).toBeDefined();
    const arg2 = mockToast.mock.calls[0][0] as UseToastOptions;
    expect(arg2.status).toBe('error');
  });
});
