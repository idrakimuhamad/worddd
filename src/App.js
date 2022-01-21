import { useState } from "react"
import { WORD_LIST } from './words'

const OPERATOR = ['enter', 'delete']

function Column({ index, isCurrentRow, letter, secretWord }) {
  function getBgColor() {
    const correctLetter = secretWord[index]
    
    if (!isCurrentRow) {
      if (secretWord.indexOf(letter) === -1) return 'bg-neutral-500'
      if (letter === correctLetter) return "bg-green-600"
    }
    return 'bg-white'
  }

  function getColor() {
    if (!isCurrentRow) {
      return 'text-white'
    }
    return 'text-black'
  }

  function getBorder() {
    if (letter && !isCurrentRow) {
      return 'border-transparent'
    }

    if (letter && isCurrentRow) {
      return 'border-neutral-400'
    }

    return 'border-neutral-300'
  }

  return (
    <div className={`flex items-center justify-center w-16 h-16 border-2 font-bold text-3xl text-center uppercase ${getBorder()} ${getBgColor()} ${getColor()} ${letter && 'animate-[scale_0.25s_ease-in-out_1]'} transition-all mx-1`}>
      {letter}
    </div>
  )
}

function Row({ index, isCurrentRow, currentColumn, secretWord, rowLetters = []}) {
  const columns = Array(5).fill("")

  return (
    <div className="flex flex-row my-1">
      {
        columns.map((_, colIndex) => (
          <Column key={colIndex} index={colIndex} isCurrentRow={isCurrentRow} letter={rowLetters.length && rowLetters[index] ? rowLetters[index][colIndex] : ""} secretWord={secretWord} />
        ))
      }
    </div>
  )
}

function Key({ code, onPress }) {
  function handlePress() {
    onPress(code)
  }

  return (
    <button onClick={handlePress} className="w-12 h-14 min-w-fit px-2 rounded transition-colors bg-neutral-300 active:bg-neutral-400 mx-1">
      <div className="flex items-center justify-center font-bold text-sm text-center uppercase">
      {code}
    </div>
    </button>
  )
}

function Keyboard({ onKeyboardTyped }) {
  const row1 = ['q','w','e','r','t','y','u','i','o','p']
  const row2 = ['a','s','d','f','g','h','j','k','l']
  const row3 = ['enter','z','x','c','v','b','n','m','delete']

  function handlePressKey(code) {
    onKeyboardTyped(code)
  }

  return (
    <div className="keyboard">
      <div className="flex flex-row justify-center mb-2">
        {row1.map((k, i) => <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} />)}
      </div>
      <div className="flex flex-row justify-center mb-2">
        {row2.map((k, i) => <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} />)}
      </div>
      <div className="flex flex-row justify-center">
        {row3.map((k, i) => <Key key={`${k}-${i}`} code={k} onPress={handlePressKey} />)}
      </div>
    </div>
  )
}

function App() {
  const [currentRowColumn, setRowColumn] = useState({
    row: 0,
    column: null
  })
  const [rowLetters, setLetters] = useState([])
  const [isDone, setDone] = useState(false)
  const [isWin, setWin] = useState(false)
  const randomIndex = Math.floor(Math.random() * WORD_LIST.length)
  const secretWord = WORD_LIST[0]
  // const secretWord = WORD_LIST[randomIndex]
  const rows = Array(6).fill("")

  function handleKeyboardTyped(code) {
    if (!isDone){
      if (!OPERATOR.includes(code)) {
        if (rowLetters[currentRowColumn.row]?.length < 5 || !rowLetters[currentRowColumn.row]?.length) {
          setRowColumn(current => {
            return {
              ...current,
              column: current.column++
            }
          })
          
          
          setLetters(prevState => {
            if (prevState.length && prevState[currentRowColumn.row]?.length) {
              const mutateRow = prevState.map((row, index) => {
                if (index === currentRowColumn.row) {
                  return [
                    ...row,
                    code
                  ]
                }
                return row
              })
      
      
              return [...mutateRow]
            } else {
              return [
                ...prevState,
                [code]
              ]
            }
          })
        }      
      }

      if (code === 'delete') {
        // delete the last letter in current row
        setLetters(prevState => {
          const lastRow = prevState.length - 1
          const mutateLetters = prevState.map((letters, index) => {
            if (index === lastRow) {
              const spliceLastItemColumn = [...letters.slice(0, letters.length - 1)]
              return [...spliceLastItemColumn]
            }

            return letters
          })

          // remove empty array
          return mutateLetters.filter(letter => letter.length)
        })


        setRowColumn(current => ({
          ...current,
          column: current.column--
        }))
      }

      if (code === 'enter') {
        const joinLetters = rowLetters[currentRowColumn.row]?.join('') ?? ''

        // must fill all 5 column before can be done
        if (joinLetters.length < 5) {
          return
        }


        // check the words with the list of words to check if its a valid word
        if (!WORD_LIST.includes(joinLetters)) {
          alert("Nope. Can't find that word.")
        } else {
          setRowColumn(current => {
            return {
              row: current.row++,
              column: 0
            }
          })

          if (secretWord === joinLetters || currentRowColumn.row === 5) {
            setDone(true)
            setWin(secretWord === joinLetters)
          }
        }
      }
    }
  }

  function handleReplay() {
    // reset back all states
    setRowColumn({
      row: 0,
      column: null
    })
    setLetters([])
    setDone(false)
    setWin(false)
  }

  return (
    <div className="flex flex-col min-h-full justify-between container mx-auto py-6">
      <header className="App-header">
        <h1 className="text-6xl text-center font-bold">Worddd</h1>
      </header>
      <div className="py-24">
        <div className="flex flex-col items-center">
        {rows.map((_, index) => (
           <Row key={index} index={index} isCurrentRow={index === currentRowColumn.row} currentColumn={currentRowColumn.column} rowLetters={rowLetters} secretWord={secretWord} />
        ))}
          <div className="py-6 text-sm text-center min-h-[10.5rem]">
            {isDone ? isWin ? (<p className="">Congrats! You got it right in {currentRowColumn.row} attempt{`${currentRowColumn.row > 1 ? 's' : ''}`}!</p>) : <p className="text-red-500">Too bad. Try again!</p> : null}
            {isDone && <button onClick={handleReplay} className="my-2 py-2 px-4 bg-violet-500 text-violet-100 text-center uppercase rounded">Try Again</button>}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Keyboard onKeyboardTyped={handleKeyboardTyped} />
      </div>
    </div>
  );
}

export default App;