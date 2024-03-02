// [a, b)の範囲で整数の乱数を取得する
function getRand(a, b){
    return parseInt(Math.random()*(b-a)+a);
}

// 1次元index -> Pair
function dim1To2(n){
    return new Pair(parseInt(n/colNum), n%colNum);
}

// first, second
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
        this.colorMoveCand = "#3afb";
        this.colorSelected = "#fd4";
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

        fetch("data.json")
            .then(res => res.json())
            .then(data => this.moveData = data["move"]);
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

    // 文字を取得する
    getChar(i, j){
        let elemGrid = document.getElementById(`js-grid-${i}${j}`);
        return elemGrid.textContent;
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

// グリッドのonclick
for (let i=0; i<rowNum*colNum; i++){
    let coord = dim1To2(i);
    let nowI = coord.first;
    let nowJ = coord.second;
    
    let elemRect = document.getElementsByClassName("rect");
    elemRect[i].onclick = ()=>{
        let selectedChar = elemRect[i].textContent;

        // マスにコマが置いてあるとき
        if (selectedChar!=="" && nowI>0 && !grid.isWall[nowI][nowJ]){
            if (selectedCoord.first===-1){
                selectedCoord = new Pair(nowI, nowJ);

                // 選択中のマスの色を変える
                grid.changeColorSelected(nowI, nowJ);

                // 動かせるマスの色を変える
                for (let coordDiff of grid.moveData[selectedChar]){
                    let diffI = coordDiff[0];
                    let diffJ = coordDiff[1];
                    let nextI = nowI+diffI;
                    let nextJ = nowJ+diffJ;
                    if (nextI<0 || nextI>=rowNum || nextJ<0 || nextJ>=colNum){
                        continue;
                    }
                    if (grid.isWall[nextI][nextJ]){
                        continue;
                    }
                    if (grid.getChar(nextI, nextJ)!==""){
                        continue;
                    }
                    grid.changeColorMoveCand(nextI, nextJ);
                }
            }
            // グリッドの色を元に戻す
            else if (nowI===selectedCoord.first && nowJ===selectedCoord.second){
                selectedCoord = new Pair(-1, -1);
                for (let j=0; j<rowNum; j++){
                    for (let k=0; k<colNum; k++){
                        if (!grid.isWall[j][k]){
                            grid.changeColorInit(j, k);
                        }
                    }
                }
            }
        }        
    };
}