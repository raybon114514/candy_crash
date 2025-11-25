document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const movesDisplay = document.getElementById('moves');
    const gameOverMessage = document.getElementById('game-over-message');
    const width = 8;
    const squares = [];
    let score = 0;
    let movesLeft = 20; // 設定總步數
    let isGameOver = false;

    const candyColors = [
        'linear-gradient(to bottom right, #ff5e62, #ff9966)', // Red style
        'linear-gradient(to bottom right, #ffd700, #ffea00)', // Yellow style
        'linear-gradient(to bottom right, #ff7e5f, #feb47b)', // Orange style
        'linear-gradient(to bottom right, #a8c0ff, #3f2b96)', // Purple style
        'linear-gradient(to bottom right, #56ab2f, #a8e063)', // Green style
        'linear-gradient(to bottom right, #4facfe, #00f2fe)'  // Blue style
    ];
    // 為了比較顏色，我們需要一個輔助函數來獲取計算後的背景樣式
    function getComputedBg(element) {
        return window.getComputedStyle(element).backgroundImage;
    }

    function createBoard() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('draggable', true);
            square.setAttribute('id', i);
            let randomColor = Math.floor(Math.random() * candyColors.length);
            square.style.backgroundImage = candyColors[randomColor];
            grid.appendChild(square);
            squares.push(square);
        }
        movesDisplay.innerHTML = movesLeft;
    }
    createBoard();

    let colorBeingDragged;
    let colorBeingReplaced;
    let squareIdBeingDragged;
    let squareIdBeingReplaced;

    squares.forEach(square => square.addEventListener('dragstart', dragStart));
    squares.forEach(square => square.addEventListener('dragend', dragEnd));
    squares.forEach(square => square.addEventListener('dragover', dragOver));
    squares.forEach(square => square.addEventListener('dragenter', dragEnter));
    squares.forEach(square => square.addEventListener('dragleave', dragLeave));
    squares.forEach(square => square.addEventListener('drop', dragDrop));

    function dragStart() {
        if(isGameOver) return;
        colorBeingDragged = this.style.backgroundImage;
        squareIdBeingDragged = parseInt(this.id);
    }

    function dragOver(e) { e.preventDefault(); }
    function dragEnter(e) { e.preventDefault(); }
    function dragLeave() { }

    function dragDrop() {
        if(isGameOver) return;
        colorBeingReplaced = this.style.backgroundImage;
        squareIdBeingReplaced = parseInt(this.id);
        this.style.backgroundImage = colorBeingDragged;
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced;
    }

    function dragEnd() {
        if(isGameOver) return;
        let validMoves = [
            squareIdBeingDragged - 1, squareIdBeingDragged - width,
            squareIdBeingDragged + 1, squareIdBeingDragged + width
        ];
        let validMove = validMoves.includes(squareIdBeingReplaced);

        if (squareIdBeingReplaced && validMove) {
            // 有效移動，扣除步數
            squareIdBeingReplaced = null;
            movesLeft--;
            movesDisplay.innerHTML = movesLeft;
            if (movesLeft === 0) {
                isGameOver = true;
                gameOverMessage.style.display = 'block';
            }
        } else if (squareIdBeingReplaced && !validMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged;
        }
    }

    // --- 核心修改：匹配邏輯加入動畫 ---
    
    function checkRowForThree() {
        for (let i = 0; i < 64; i++) {
            let rowOfThree = [i, i + 1, i + 2];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === '';

            const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63];
            if (notValid.includes(i)) continue;

            if (rowOfThree.every(index => getComputedBg(squares[index]) === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                
                rowOfThree.forEach(index => {
                    // 1. 先加上動畫 class，讓它播放縮小動畫
                    squares[index].classList.add('candy-match');
                });

                // 2. 等待 300ms 動畫播放完畢後，再真正清除顏色
                setTimeout(() => {
                    rowOfThree.forEach(index => {
                        squares[index].style.backgroundImage = '';
                        squares[index].classList.remove('candy-match');
                    });
                }, 300); // 這個時間要跟 CSS 的 animation 時間一致
            }
        }
    }

    function checkColumnForThree() {
        for (let i = 0; i < 47; i++) {
            let columnOfThree = [i, i + width, i + width * 2];
            let decidedColor = squares[i].style.backgroundImage;
            const isBlank = squares[i].style.backgroundImage === '';

            if (columnOfThree.every(index => getComputedBg(squares[index]) === decidedColor && !isBlank)) {
                score += 3;
                scoreDisplay.innerHTML = score;
                
                columnOfThree.forEach(index => {
                    squares[index].classList.add('candy-match');
                });

                setTimeout(() => {
                    columnOfThree.forEach(index => {
                        squares[index].style.backgroundImage = '';
                        squares[index].classList.remove('candy-match');
                    });
                }, 300);
            }
        }
    }

    function moveDown() {
        for (let i = 0; i < 55; i++) {
            if (squares[i + width].style.backgroundImage === '') {
                if (i < width) {
                    let randomColor = Math.floor(Math.random() * candyColors.length);
                    squares[i].style.backgroundImage = candyColors[randomColor];
                } 
                if (squares[i].style.backgroundImage !== '') {
                    squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                    squares[i].style.backgroundImage = '';
                }
            }
        }
        for (let i = 0; i < width; i++) {
            if(squares[i].style.backgroundImage === '') {
                let randomColor = Math.floor(Math.random() * candyColors.length);
                squares[i].style.backgroundImage = candyColors[randomColor];
            }
        }
    }

    window.setInterval(function() {
        if(isGameOver) return;
        moveDown();
        checkRowForThree();
        checkColumnForThree();
    }, 100);
});