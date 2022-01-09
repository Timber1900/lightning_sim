import type { NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'

interface gridType {
  borderUp: boolean,
  borderDown: boolean,
  borderLeft: boolean,
  borderRight: boolean,
  checked: boolean,
  solvedIndex: number | null,
  age: number,
  i: number,
  j: number,
  cellPathCheck: boolean
}

const Home: NextPage = () => {
  const NUM_COLS = 31
  const NUM_ROWS = 31

  const [grid, setGrid] = useState<gridType[][]>([])
  const [solvedCells, setSolvedCells] = useState<gridType[]>([])

  const initGrid = () => {
    const newGrid = []
    for (let i = 0; i < NUM_ROWS; i++) {
      const row = []
      for (let j = 0; j < NUM_COLS; j++) {
        //initialize all cells to random values of true or false
        row.push({
          borderUp: Math.random() > 0.9,
          borderDown: Math.random() > 0.9,
          borderLeft: Math.random() > 0.9,
          borderRight: Math.random() > 0.9,
          checked: (i * NUM_COLS + j === (NUM_COLS - 1) / 2) ? true : false,
          age: (i * NUM_COLS + j === (NUM_COLS - 1) / 2) ? 1 : 0,
          i: i,
          j: j,
          solvedIndex: null,
          cellPathCheck: false
        })
      }
      newGrid.push(row)
    }
    setGrid(newGrid)
    setSolvedCells([newGrid[0][(NUM_COLS - 1) / 2]])
  }

  const solveMaze = (cellsToSolve: gridType[]) => {
    const newCells: gridType[] = [];

    for(const cell of cellsToSolve) {
      let topCheck, bottomCheck, leftCheck, rightCheck;
      if(cell.i-1>=0) {
        topCheck = grid[cell.i-1][cell.j].borderDown;
        if(!grid[cell.i-1][cell.j].checked && !cell.borderUp && !topCheck) {
          if(!newCells.includes(grid[cell.i-1][cell.j])) {
            grid[cell.i-1][cell.j].solvedIndex = cell.i * NUM_COLS + cell.j;
            newCells.push(grid[cell.i-1][cell.j])
          }
        }
      }
      if(cell.i+1<NUM_ROWS) {
        bottomCheck = grid[cell.i+1][cell.j].borderUp;
        if(!grid[cell.i+1][cell.j].checked && !cell.borderDown && !bottomCheck) {
          if(!newCells.includes(grid[cell.i+1][cell.j])) {
            grid[cell.i+1][cell.j].solvedIndex = cell.i * NUM_COLS + cell.j;
            newCells.push(grid[cell.i+1][cell.j])
          }
        }
      }
      if(cell.j-1>=0) {
        leftCheck = grid[cell.i][cell.j-1].borderRight;
        if(!grid[cell.i][cell.j-1].checked && !cell.borderLeft && !leftCheck) {
          if(!newCells.includes(grid[cell.i][cell.j-1])) {
            grid[cell.i][cell.j-1].solvedIndex = cell.i * NUM_COLS + cell.j;
            newCells.push(grid[cell.i][cell.j-1])
          }
        }
      }
      if(cell.j+1<NUM_COLS) {
        rightCheck = grid[cell.i][cell.j+1].borderLeft;
        if(!grid[cell.i][cell.j+1].checked && !cell.borderRight && !rightCheck) {
          if(!newCells.includes(grid[cell.i][cell.j+1])) {
            grid[cell.i][cell.j+1].solvedIndex = cell.i * NUM_COLS + cell.j;
            newCells.push(grid[cell.i][cell.j+1])
          }
        }
      };
    }
    const tempGrid = [...grid];
    newCells.forEach(val => val.checked = true)
    tempGrid.forEach(val => val.forEach(cell => {if(cell.checked) cell.age++}))
    setGrid(tempGrid)
    return(newCells)
  }

  useEffect(() => {
    initGrid()
  }, [])

  const testFunc = async () => {
    let test = false;
    let iterations = 0;
    let tempSolvedCells: gridType[] = solvedCells;
    while(!test && iterations < 1000) {
      tempSolvedCells = solveMaze(tempSolvedCells);
      setSolvedCells(tempSolvedCells)
      test = false;
      for(const cell of tempSolvedCells) {
        test = (cell.i === NUM_ROWS - 1 && !cell.borderDown) ? true : test;
      }
      await (async () => {
        return new Promise<void>((res, rej) => setTimeout(() => res(), 10))
      })()
    }
  }

  return (
    <div className='flex items-center justify-center w-screen h-screen'>
      <Head>
        <title>Lightning Sym</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={`grid grid-rows-none`}>
        {grid.map((row, i) => {
          return(
            <div className='flex flex-row items-center justify-center' key={`row-${i}`}>
              {row.map((cell, j) =>
                {
                  let topCheck, bottomCheck, leftCheck, rightCheck;
                  if(i-1>=0) topCheck = grid[i-1][j].borderDown;
                  if(i+1<NUM_ROWS) bottomCheck = grid[i+1][j].borderUp;
                  if(j-1>=0) leftCheck = grid[i][j-1].borderRight;
                  if(j+1<NUM_COLS) rightCheck = grid[i][j+1].borderLeft;

                  const topString = (cell.borderUp || topCheck) ? (i == 0) ? "border-t-2" : "border-t": "";
                  const bottomString = (cell.borderDown || bottomCheck) ? (i == NUM_ROWS-1) ? "border-b-2" : "border-b" : "";
                  const leftString = (cell.borderLeft || leftCheck) ? (j == 0) ? "border-l-2" : "border-l" : "";
                  const rightString = (cell.borderRight || rightCheck) ? (j == NUM_COLS-1) ? "border-r-2" : "border-r" : "";

                  const opacity = (cell.age !== 0 && !cell.cellPathCheck) ? 1 / cell.age : 1;

                  return (
                    <div className={`w-6 h-6 border-black ${topString} ${bottomString} ${leftString} ${rightString}`} key={`cell-${i*NUM_COLS + j}`}>
                      <div className={`w-full h-full ${(cell.cellPathCheck) ? "bg-yellow-400" : ((cell.checked) ? "bg-red-400" : "bg-white")}`} style={{opacity: opacity}} onClick={async () => {
                        let cur_i = cell.i;
                        let cur_j = cell.j;
                        let cur_cell = cell;
                        const tempGrid = [...grid];
                        // tempGrid.forEach(val => val.forEach(cell => cell.cellPathCheck = false))
                        // setGrid(tempGrid);
                        // await (async () => {
                        //   return new Promise<void>((res, rej) => setTimeout(() => res(), 10))
                        // })()
                        while(cur_i !== (NUM_COLS - 1) / 2 || cur_j !== 0) {
                          const tempGrid = [...grid];
                          if(!cur_cell.solvedIndex) break
                          cur_cell = grid[Math.floor(cur_cell.solvedIndex / NUM_COLS)][cur_cell.solvedIndex - Math.floor(cur_cell.solvedIndex / NUM_COLS) * NUM_COLS]
                          cur_i = cur_cell.i;
                          cur_j = cur_cell.j;
                          tempGrid[cur_i][cur_j].cellPathCheck = true;
                          setGrid(tempGrid);
                          await (async () => {
                            return new Promise<void>((res, rej) => setTimeout(() => res(), 3))
                          })()
                        }
                      }}>
                      </div>
                    </div>
                )}
              )}
            </div>
          )
        })}
      </main>
      <button onClick={testFunc}>TEST</button>
    </div>
  )
}

export default Home
