sessionStorage.clear();
let seed = sessionStorage.getItem("seed");
if (seed===null){
    seed = Math.random().toString();
    sessionStorage.setItem("seed", seed);
}
Math.seedrandom(seed);

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
        this.friendOrOpponent = friendOrOpponent;
        // coord[char] = Pair(i, j)
        this.coord = {};
        for (let i=0; i<rowNum; i++){
            if (friendOrOpponent==="friend"){
                this.coord[charList[i]] = new Pair(rowNum-1, i);
            } else if (friendOrOpponent==="opponent"){
                this.coord[charList[i]] = new Pair(0, i);
            }
        }
    }

    move(i, j, char){
        grid.move(i, j, char, this.friendOrOpponent);
        this.coord[char] = new Pair(i, j);
    }

    hasCoord(i, j){
        for (let char of charList){
            let p = this.coord[char].first;
            let q = this.coord[char].second;
            if (i===p && j===q){
                return true;
            }
        }
        return false;
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
        this.isMoveCand = Array(rowNum);
        for (let i=0; i<rowNum; i++){
            this.isMoveCand[i] = Array(colNum);
            this.isMoveCand[i].fill(false);
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

    move(i, j, char, friendOrOpponent){
        let coord;
        if (friendOrOpponent==="friend"){
            coord = pieceFriend.coord[char];
        } else if (friendOrOpponent==="opponent"){
            coord = pieceOpponent.coord[char];
        }
        let preI = coord.first;
        let preJ = coord.second;
        this.getGridElem(preI, preJ).textContent = "";
        this.getGridElem(i, j).textContent = char;
        if (friendOrOpponent==="opponent"){
            this.removeRotate180(preI, preJ);
            this.addRotate180(i, j);
        }
    }

    addRotate180(i, j){
        this.getGridElem(i, j).setAttribute("class", "rect rotate180");
    }

    removeRotate180(i, j){
        this.getGridElem(i, j).setAttribute("class", "rect");
    }

    // マスのエレメントを取得する
    getGridElem(i, j){
        return document.getElementById(`js-grid-${i}${j}`);
    }

    // 文字を取得する
    getChar(i, j){
        return this.getGridElem(i, j).textContent;
    }

    // マスの色を変える
    changeColor(i, j, color){
        this.getGridElem(i, j).style.backgroundColor = color;
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

    // 動かせるマスの色を変える
    onclickChangeColorMoveCand(selectedChar, nowI, nowJ){
        for (let coordDiff of this.moveData[selectedChar]){
            let diffI = coordDiff[0];
            let diffJ = coordDiff[1];
            let nextI = nowI+diffI;
            let nextJ = nowJ+diffJ;
            if (nextI<0 || nextI>=rowNum || nextJ<0 || nextJ>=colNum){
                continue;
            }
            if (this.isWall[nextI][nextJ]){
                continue;
            }
            if (this.getChar(nextI, nextJ)!==""){
                continue;
            }
            this.changeColorMoveCand(nextI, nextJ);
        }
    }

    // グリッドの色を元に戻す
    resetGridColor(){
        selectedCoord = new Pair(-1, -1);
        for (let i=0; i<rowNum; i++){
            for (let j=0; j<colNum; j++){
                if (!this.isWall[i][j]){
                    this.changeColorInit(i, j);
                }
            }
        }
    }

    // isMoveCandをtrueにする
    addIsMoveCand(nowI, nowJ, selectedChar){
        let cancel = false;
        for (let coordDiff of this.moveData[selectedChar]){
            let diffI = coordDiff[0];
            let diffJ = coordDiff[1];
            let nextI = nowI+diffI;
            let nextJ = nowJ+diffJ;
            if (nextI<0 || nextI>=rowNum || nextJ<0 || nextJ>=colNum){
                continue;
            }
            if (this.getChar(nextI, nextJ)!==""){
                continue;
            }
            if (this.isWall[nextI][nextJ]){
                if (['F', 'G'].includes(selectedChar) &&
                (Math.abs(diffI)===1 || Math.abs(diffJ)===1)){
                    cancel = true;
                    continue;
                }
            }
            if (cancel){
                cancel = false;
                continue;
            }
            this.isMoveCand[nextI][nextJ] = true;
        }
    }

    // isMoveCandをfalseにする
    resetIsMoveCand(){
        for (let i=0; i<rowNum; i++){
            for (let j=0; j<colNum; j++){
                this.isMoveCand[i][j] = false;
            }
        }
    }
}

let rowNum = 9;
let colNum = 7;
let charList = ["A", "B", "C", "D", "E", "F", "G"];

// グリッドを生成
let grid = new Grid(rowNum, colNum);
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
let movingChar = "";

// グリッドのonclick
for (let i=0; i<rowNum*colNum; i++){
    let coord = dim1To2(i);
    let nowI = coord.first;
    let nowJ = coord.second;
    let elemRect = document.getElementsByClassName("rect");
    
    elemRect[i].onclick = ()=>{
        let selectedChar = elemRect[i].textContent;

        // 選択したマスにコマが置かれているとき
        if (selectedChar!=="" && pieceFriend.hasCoord(nowI, nowJ) && !grid.isWall[nowI][nowJ]){

            // マスが選択されていないとき
            if (selectedCoord.first===-1){
                selectedCoord = new Pair(nowI, nowJ);
                // 選択中のマスの色を変える
                grid.changeColorSelected(nowI, nowJ);
                // 動かせるマスの色を変える
                grid.onclickChangeColorMoveCand(selectedChar, nowI, nowJ);
                // isMoveCandをtrueにする
                grid.addIsMoveCand(nowI, nowJ, selectedChar);
                movingChar = selectedChar;
            }
            // マスを選択中のとき
            else if (nowI===selectedCoord.first && nowJ===selectedCoord.second){
                // グリッドの色を元に戻す
                grid.resetGridColor();
                // isMoveCandをfalseにする
                grid.resetIsMoveCand();
                movingChar = "";
            }
        }
        // 選択したマスにコマが置かれていないとき
        // 移動候補マスに選ばれているとき
        else if (selectedChar==="" && grid.isMoveCand[nowI][nowJ] && !grid.isWall[nowI][nowJ]){
            pieceFriend.move(nowI, nowJ, movingChar);
            // グリッドの色を元に戻す
            grid.resetGridColor();
            // isMoveCandをfalseにする
            grid.resetIsMoveCand();
            movingChar = "";
        }
    };
}

/*
to do

・リセットを押すと別の乱数シードから盤面を再生成する
*/