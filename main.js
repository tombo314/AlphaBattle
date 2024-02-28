// [a, b)の範囲で整数の乱数を取得する
function getRand(a, b){
    return parseInt(Math.random()*(b-a)+a);
}

// 1次元index -> Pair
function dim1To2(n){
    return new Pair(parseInt(n/colNum), n%colNum);
}

// C++のpair
class Pair {
    constructor(first, second){
        this.first = first;
        this.second = second;
    }
}

// コマを管理する
class Piece {
    constructor(friendOrOpponent){
        this.coord = {};
        for (let i=0; i<rowNum; i++){
            if (friendOrOpponent==="friend"){
                this.coord[charList[i]] = new Pair(rowNum-1, i);
            } else if (friendOrOpponent==="opponent"){
                this.coord[charList[i]] = new Pair(0, i);
            }
        }
    }

    move(i, j, piece, friendOrOpponent){
        if (friendOrOpponent==="friend"){
        } else if (friendOrOpponent==="opponent"){
        }
    }
}

// グリッドを管理する
class Grid {
    constructor(rowNum, colNum){
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.colorInit = "#fca3";
        this.colorWall = "#555";
        this.colorMoveCand = "#3af4";
        this.colorSelected = "#fd7e";
        this.isWall = Array(rowNum);
        for (let i=0; i<rowNum; i++){
            this.isWall[i] = Array(colNum);
            this.isWall[i].fill(false);
        }
        this.isSelected = Array(rowNum);
        for (let i=0; i<rowNum; i++){
            this.isSelected[i] = Array(colNum);
            this.isSelected[i].fill(false);
        }
    }

    // グリッドを生成する
    makeGrid(){
        let elemGrid = document.getElementById("js-grid");
        
        // 相手側
        for (let i=0; i<this.colNum; i++){
            let elemRect = document.createElement("div");
            elemRect.setAttribute("class", "rect rotate180");
            elemRect.setAttribute("id", `js-grid-0${i}`);
            elemRect.textContent = charList[charList.length-i-1];
            elemGrid.appendChild(elemRect);
        }

        // 相手と自分の間
        for (let i=0; i<this.rowNum-2; i++){
            for (let j=0; j<colNum; j++){
                let elemRect = document.createElement("div");
                elemRect.setAttribute("class", "rect");
                elemRect.setAttribute("id", `js-grid-${i+1}${j}`);
                elemGrid.appendChild(elemRect);
            }
        }
        
        // 自分側
        for (let i=0; i<this.colNum; i++){
            let elemRect = document.createElement("div");
            elemRect.setAttribute("class", "rect");
            elemRect.setAttribute("id", `js-grid-${rowNum-1}${i}`);
            elemRect.textContent = charList[i];
            elemGrid.appendChild(elemRect);
        }
    }

    // マスの色を変える
    changeColor(i, j, color){
        let elemGrid = document.getElementById(`js-grid-${i}${j}`);
        elemGrid.style.backgroundColor = color;
    }

    // マスの色を変える（初期化）
    changeColorInit(i, j){
        this.changeColor(i, j, this.colorInit);
    }

    // マスの色を変える（壁）
    changeColorWall(i, j){
        this.changeColor(i, j, this.colorWall);
    }
    
    // マスの色を変える（移動できるマス）
    changeColorMoveCand(i, j){
        this.changeColor(i, j, this.colorMoveCand);
    }

    // マスの色を変える（コマを選択）
    changeColorSelected(i, j){
        this.changeColor(i, j, this.colorSelected);
    }
}

let rowNum = 9;
let colNum = 7;
let charList = ["A", "B", "C", "D", "E", "F", "G"];

let grid = new Grid(rowNum, colNum);

// グリッドを生成
grid.makeGrid();

// ランダムに壁を生成
let wallNum = 7;
for (let i=0; i<wallNum; i++){
    let randRow = getRand(2, rowNum-2);
    let randCol = getRand(0, colNum);
    grid.isWall[randRow][randCol] = true;
    grid.changeColorWall(randRow, randCol);
}

let pieceFriend = new Piece("friend");
let pieceOpponent = new Piece("opponent");

let selectedCoord = new Pair(-1, -1);
let elemRect = document.getElementsByClassName("rect");
for (let i=0; i<rowNum*colNum; i++){
    let coord = dim1To2(i);
    let p = coord.first;
    let q = coord.second;
    elemRect[i].onclick = ()=>{
        if (elemRect[i].textContent!=="" && p>0 && !grid.isWall[p][q]){
            if (selectedCoord.first===-1){
                selectedCoord = new Pair(p, q);
                grid.changeColorSelected(p, q);
            } else if (p===selectedCoord.first && q===selectedCoord.second){
                selectedCoord = new Pair(-1, -1);
                grid.changeColorInit(p, q);
            }
        }
    };
}