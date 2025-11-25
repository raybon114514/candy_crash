document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const width = 8; // 8x8 的網格
    const squares = [];
    let score = 0;

    // 糖果顏色陣列
    const candyColors = [
        'red',
        'yellow',
        'orange',
        'purple',
        'green',
        'blue'
    ];

    // 1. 建立棋盤
    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('draggable', true);
            square.setAttribute('id', i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundColor = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
    }
    createBoard();

    // 2. 拖曳相關變數
    let colorBeingDragged;
    let colorBeingReplaced;
    let squareIdBeingDragged;
    let squareIdBeingReplaced;

    // 監聽拖曳事件
    squares.forEach(square => square.addEventListener('dragstart', dragStart));
    squares.forEach(square => square.addEventListener('dragend', dragEnd));
    squares.forEach(square => square.addEventListener('dragover', dragOver));
    squares.forEach(square => square.addEventListener('dragenter', dragEnter));
    squares.forEach(square => square.addEventListener('dragleave', dragLeave));
    squares.forEach(square => square.addEventListener('drop', dragDrop));

    function dragStart() {
        colorBeingDragged = this.style.backgroundColor;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dragEnter(e) {
        e.preventDefault();
    }

    function dragLeave() {
        // 這裡不需要做什麼
    }

    function dragDrop() {
        colorBeingReplaced = this.style.backgroundColor;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundColor = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundColor = colorBeingReplaced;
    }

    function dragEnd() {
        // 判斷是否為有效移動（上下左右一格）
        let validMoves = [
            squareIdBeingDragged - 1,
            squareIdBeingDragged - width,
            squareIdBeingDragged + 1,
            squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            // 交換後如果不消除，這裡可以加邏輯換回來（簡化版省略）
            squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
            // 無效移動，顏色換回來
            squares[squareIdBeingReplaced].style.backgroundColor = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundColor = colorBeingDragged;
        } else {
            squares[squareIdBeingDragged].style.backgroundColor = colorBeingDragged;
        }
    }

    // 3. 檢查匹配邏輯
    
    // 檢查列 (Row)
    function checkRowForThree() {
        for (let i = 0; i < 64; i++) {
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = squares[i].style.backgroundColor;
            const isBlank = squares[i].style.backgroundColor === '';

            // 邊界檢查：不檢查每行的最後兩個格子，避免跨行消除
            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            if (notValid.includes(i)) continue;

            if (rowOfThree.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                rowOfThree.forEach(index => {
                    squares[index].style.backgroundColor = ''; // 清空顏色
                });
            }
        }
    }

    // 檢查欄 (Column)
    function checkColumnForThree() {
        for (let i = 0; i < 47; i++) {
            let columnOfThree = [i, i + width, i + width * 2];
            let decidedColor = squares[i].style.backgroundColor;
            const isBlank = squares[i].style.backgroundColor === '';

            if (columnOfThree.every(index => squares[index].style.backgroundColor === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                columnOfThree.forEach(index => {
                    squares[index].style.backgroundColor = '';
                });
            }
        }
    }

    // 4. 下落與補充糖果
    function moveDown() {
        for (let i = 0; i < 55; i++) { // 檢查到倒數第二列
            if (squares[i + width].style.backgroundColor === '') {
                if (i < width) {
                    // 如果是第一列，且下方為空，隨機生成新糖果
                    let randomColor = Math.floor(Math.random() * candyColors.length);
                    squares[i].style.backgroundColor = candyColors[randomColor];
                } 
                // 將上方顏色移下來
                if (squares[i].style.backgroundColor !== '') {
                    squares[i + width].style.backgroundColor = squares[i].style.backgroundColor;
                    squares[i].style.backgroundColor = '';
                }
            }
        }
        // 處理第一列的生成（如果第一列本身就是空的）
        for (let i = 0; i < width; i++) {
            if(squares[i].style.backgroundColor === '') {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundColor = candyColors[randomColor];
            }
        }
    }

    // 遊戲循環
    window.setInterval(function() {
        moveDown();
        checkRowForThree();
        checkColumnForThree();
    }, 100);
});