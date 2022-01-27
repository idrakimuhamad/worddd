import { useState } from "react";
import { WORD_LIST } from "./words";

const OPERATOR = ["enter", "delete"];
const NOT_EXISTS = "not_exists"
const EXISTS = "exists"
const CORRECT = "correct"

function Column({ index, isCurrentRow, column, }) {
  function getBgColor() {
    if (!isCurrentRow && column) {
      if (column.status === CORRECT) return "bg-green-600";
      if (column.status === NOT_EXISTS) return "bg-neutral-500";
      if (column.status === EXISTS) return "bg-yellow-300";
    }

    return "bg-white";
  }

  function getColor() {
    if (!isCurrentRow) {
      return "text-white";
    }
    return "text-black";
  }

  function getBorder() {
    if (column) {
      if (column.letter && !isCurrentRow) {
        return "border-transparent";
      }
  
      if (column.letter && isCurrentRow) {
        return "border-neutral-400";
      }
    }

    return "border-neutral-300";
  }

  return (
    <div
      className={`inline-flex w-full border-2 justify-center items-center font-bold text-3xl text-center uppercase ${getBorder()} ${getBgColor()} ${getColor()} ${
        column?.letter && "animate-[scale_0.25s_ease-in-out_1]"
      } transition-all before:content-[''] before:inline-block before:pb-[100%]`}
    >
      {column?.letter ?? ""}
    </div>
  );
}

function Row({
  index,
  isCurrentRow,
  rowLetters = [],
}) {
  const columns = Array(5).fill("");


  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {columns.map((_, colIndex) => {
        return (
          <Column
            key={colIndex}
            index={colIndex}
            isCurrentRow={isCurrentRow}
            column={
              rowLetters.length && rowLetters[index]
                ? rowLetters[index][colIndex]
                : ""
            }
          />
        )
      })}
    </div>
  );
}

function Key({ code, onPress, usedLetters = [] }) {
  const inUsed = usedLetters.find(l => l.letter === code)
  function handlePress() {
    onPress(code);
  }

  function getBgColor() {
    if (inUsed) {
      if (inUsed.status === CORRECT) return 'bg-green-600'
      if (inUsed.status === EXISTS) return 'bg-yellow-300'
      return 'bg-neutral-400'
    }

    return "bg-neutral-300"
  }

  return (
    <button
      onClick={handlePress}
      className={`flex flex-1 ${
        code === "enter" || code === "delete" ? "flex-[1.5] text-sm" : ""
      } items-center justify-center font-bold text-xs text-center uppercase h-12 rounded transition-colors ${getBgColor()} active:bg-neutral-400 mr-1 touch-manipulation`}
    >
      {code}
    </button>
  );
}

function Keyboard({ onKeyboardTyped, usedLetters = [] }) {
  const row1 = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"];
  const row2 = ["", "a", "s", "d", "f", "g", "h", "j", "k", "l", ""];
  const row3 = ["enter", "z", "x", "c", "v", "b", "n", "m", "delete"];

  function handlePressKey(code) {
    onKeyboardTyped(code);
  }

  return (
    <div className="keyboard">
      <div className="flex mb-2">
        {row1.map((k, i) => (
          <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} usedLetters={usedLetters}/>
        ))}
      </div>
      <div className="flex mb-2">
        {row2.map((k, i) =>
          !k ? (
            <div key={`spacer-${i}`} className="flex flex-[0.5]" />
          ) : (
            <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} usedLetters={usedLetters}/>
          )
        )}
      </div>
      <div className="flex">
        {row3.map((k, i) => (
          <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} usedLetters={usedLetters}/>
        ))}
      </div>
    </div>
  );
}

const randomIndex = Math.floor(Math.random() * WORD_LIST.length);

function getStatusPriority(a, b) {
  if (a === CORRECT || b === CORRECT) return CORRECT
  if (a === EXISTS || b === EXISTS) return EXISTS
  return NOT_EXISTS
}

function App() {
  const [currentRowColumn, setRowColumn] = useState({
    row: 0,
    column: null,
  });
  const [rowLetters, setLetters] = useState([]);
  const [attemptedLetters, setAttemptedLetters] = useState([]);
  const [isDone, setDone] = useState(false);
  const [isWin, setWin] = useState(false);
  const secretWord = WORD_LIST[randomIndex];
  const rows = Array(6).fill("");

  const checkRowLetters = function(attempt, secret) {
    // turn the attempts into array
    const attemptsArray = attempt.split('')
    const secretsArray = secret.split('')

    // the first array check to indicate if the attempt word is correct and found
    const correctCheck = Array(secret.length).fill(true)

    // the second array to indicate if the letter is found although not at correct place
    const existenceCheck = Array(secret.length).fill(true)

    // loop through the attempt and check for correct letter
    let status = attemptsArray.map((a, i) => {
        if (a === secret[i] && existenceCheck[i]) {
            // set the check to false
            correctCheck[i] = false
            existenceCheck[i] = false

            return CORRECT
        }

        return NOT_EXISTS
    })

    // another loop for each letter that are not yet found
    attemptsArray.forEach((letter, i) => {
        // this haven't been found yet
        if (correctCheck[i]) {
          // go each secret and find this letter
          for (let idx = 0; idx < secret.length; idx++) {
            const secretWord = secret[idx];

            if (existenceCheck[idx] && secretWord === letter) {
              status[i] = EXISTS
              existenceCheck[idx] = false
              break
            }
          }
        }
    })

    return status
}

  function handleKeyboardTyped(code) {
    if (!isDone) {
      if (!OPERATOR.includes(code)) {
        if (
          rowLetters[currentRowColumn.row]?.length < 5 ||
          !rowLetters[currentRowColumn.row]?.length
        ) {
          setRowColumn((current) => {
            return {
              ...current,
              column: current.column + 1,
            };
          });

          setLetters((prevState) => {
            if (prevState.length && prevState[currentRowColumn.row]?.length) {
              const mutateRow = prevState.map((row, index) => {
                if (index === currentRowColumn.row) {
                  return [...row, {
                    letter: code,
                    status: ''
                  }];
                }
                return row;
              });

              return [...mutateRow];
            } else {
              return [...prevState, [{
                letter: code, 
                status: ''
              }]];
            }
          });
        }
      }

      if (code === "delete") {
        if (rowLetters[currentRowColumn.row]?.length) {
          // delete the last letter in current row
          setLetters((prevState) => {
            const lastRow = prevState.length - 1;
            const mutateLetters = prevState.map((letters, index) => {
              if (index === lastRow) {
                const spliceLastItemColumn = [
                  ...letters.slice(0, letters.length - 1),
                ];
                return [...spliceLastItemColumn];
              }

              return letters;
            });

            // remove empty array
            return mutateLetters.filter((letter) => letter.length);
          });

          setRowColumn((current) => ({
            ...current,
            column: current.column - 1,
          }));
        }        
      }

      if (code === "enter") {
        const joinLetters = rowLetters[currentRowColumn.row]?.reduce((p, c) => p + c.letter, '') ?? "";

        // must fill all 5 column before can be done
        if (joinLetters.length < 5) {
          return;
        }

        // naive solution to check the words
        // with the list of words to check if its a valid word
        if (!WORD_LIST.includes(joinLetters)) {
          alert("Nope. Can't find that word.");
        } else {
          const lastRow = rowLetters.length - 1;
          const currentRow = rowLetters[lastRow]

            // get the current row to be check
          const validatedRow = checkRowLetters(joinLetters, secretWord)

          // map the status with the row
          const currentRowWithStatus = currentRow.map((c, i) => ({
            ...c,
            status: validatedRow[i]
          }))

          const attemptLetterStatus = currentRowWithStatus.reduce((p, c, i) => {
            // find the attempt if not exists in state
            const alreadyAttempted = p.find(a => (a.letter === c.letter))

            if (alreadyAttempted) {
              // check the status
              const status = getStatusPriority(alreadyAttempted.status, c.status)

              // remove the first attempt and add the new one
              const withoutAttempt = p.filter(a => a.letter !== c.letter)

              return [
                ...withoutAttempt,
                {...c, status}
              ]
            }

            return [
              ...p,
              {...c}
            ]

          }, [...attemptedLetters])

          setAttemptedLetters(attemptLetterStatus)

          setLetters((prevState) => {
            const currentLettersWithoutLastItem = prevState.filter((_, i) => i < lastRow)

            // remove empty array
            return [...currentLettersWithoutLastItem, currentRowWithStatus]
          });

          setRowColumn((current) => {
            return {
              row: current.row + 1,
              column: 0,
            };
          });

          if (secretWord === joinLetters || currentRowColumn.row === 5) {
            setDone(true);
            setWin(secretWord === joinLetters);
          }
        }
      }
    }
  }

  function handleReplay() {
    // reload the page
    window.location.reload();
  }

  return (
    <div className="flex flex-col min-h-full justify-between container mx-auto py-6">
      <header className="App-header flex justify-center relative">
        <h1 className="text-4xl md:text-6xl text-center font-bold">Worddd</h1>
        {isDone && (
          <div className="absolute text-center bg-neutral-700 text-neutral-200 top-24 rounded w-1/2 md:w-1/3 p-2 md:p-12">
            {isWin ? (
            <p className="text-center">
              Congrats! You got it right in {currentRowColumn.row} attempt
              {`${currentRowColumn.row > 1 ? "s" : ""}`}!
            </p>
            ) : (
            <>
              <p>Too bad. Try again!</p>
              <p>
                The word is <span className="uppercase font-bold">{secretWord}</span>
              </p>
            </>
            )}
            {isDone && <button onClick={handleReplay} className="mt-12 py-2 px-4 bg-violet-500 text-violet-100 text-sm text-center font-bold uppercase rounded">{isWin ? "Play again" : "Try Again"}</button>}
          </div>
        )}
      </header>

      <div className="xl:py-24 px-8 w-full max-w-[24rem] mx-auto">
        <div className="grid grid-rows-6 gap-2">
          {rows.map((_, index) => (
            <Row
              key={index}
              index={index}
              isCurrentRow={index === currentRowColumn.row}
              currentColumn={currentRowColumn.column}
              rowLetters={rowLetters}
            />
          ))}
        </div>
      </div>
      <div className="px-2 w-full md:max-w-[50%] mx-auto">
        <Keyboard onKeyboardTyped={handleKeyboardTyped} usedLetters={attemptedLetters} />
      </div>
    </div>
  );
}

export default App;
