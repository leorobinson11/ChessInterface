//html elments
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;



//constants
//squaresize
const SS = 82;
//margins
const MARGIN = { x : canvas.width*0.25, y : canvas.height*0.1}


//checks for the validity of moves
function isonBoard(x, y) {
    if (x > 7 || y > 7 || x < 0 || y < 0) {
        return false;
    };
    return true;
};

function getallMoves(iswhite) {
    //gets all the valid moves of the other side
    let allvalidmoves = [];
    Object.values(pieces).forEach(piece => {
        if (piece.iswhite === !iswhite) {
            allvalidmoves = allvalidmoves.concat(piece.gettheoreticalMoves());
        };
    });
    return allvalidmoves;
};

function contains(arr2D, targetArray) {
    return arr2D.some(subArray => {
        // Compare the subArray with the targetArray
        if (subArray.length !== targetArray.length) {
            // Array lengths are different, not a match
            return false; 
        };
        for (let i = 0; i < subArray.length; i++) {
            if (subArray[i] !== targetArray[i]) {
                // Found a mismatch, not a match
                return false; 
            };
        };
        // All elements match
        return true; 
    });
};

function getfilteredMoves(clickedpiece) {
    let tempmoves = clickedpiece.getMoves()
    let fmoves = [];

    //going through all the moves and filtering them for if onew where the king ends in check
    tempmoves.forEach((move) => {
        //savigng the state of the pieces
        let saved_pieces = {... pieces}
        let sx = clickedpiece.pos.x;
        let sy = clickedpiece.pos.y;

        delete pieces[[clickedpiece.pos.x, clickedpiece.pos.y]];
        clickedpiece.pos = {x: move[0], y: move[1]};
        pieces[[move[0], move[1]]] = clickedpiece;

        if (!incheck()) {
            fmoves.push(move);
        }; 

        //returning to the original state of the pieces
        clickedpiece.pos = {x: sx, y:sy};
        pieces = {... saved_pieces};
    });
    return fmoves
};
  


//parent class of all the pieces
class Piece {
    constructor(pos, name, iswhite) {
        this.pos = pos;
        this.name = name;
        this.image = new Image();
        this.iswhite = iswhite;
        this.image.src = iswhite ? `images/white/${this.name}.png` : `images/black/${this.name}.png`;
    };
    draw() {
        c.imageSmoothingEnabled = false;
        c.drawImage(this.image, MARGIN.x + SS*this.pos.x, MARGIN.y + SS*this.pos.y, SS, SS)
    };
};

class Pawn extends Piece {
    constructor(...args) {
        super(...args);
    };

    getMoves() {
        let validmoves = [];
        if (this.iswhite) {
            if (!pieces[[this.pos.x, this.pos.y-1]]) {
                validmoves.push([this.pos.x, this.pos.y-1]);
                if (this.pos.y === 6 && !pieces[[this.pos.x, this.pos.y-2]]) {
                    validmoves.push([this.pos.x, this.pos.y-2]);
                };
            };
            if (pieces[[this.pos.x+1, this.pos.y-1]]) {
                if (pieces[[this.pos.x+1, this.pos.y-1]].iswhite == !this.iswhite) {
                    validmoves.push([this.pos.x+1, this.pos.y-1])
                };
            };
            if (pieces[[this.pos.x-1, this.pos.y-1]]) {
                if (pieces[[this.pos.x-1, this.pos.y-1]].iswhite == !this.iswhite) {
                    validmoves.push([this.pos.x-1, this.pos.y-1])
                };
            };
            
            
        } else {
            if (!pieces[[this.pos.x, this.pos.y+1]]) {
                validmoves.push([this.pos.x, this.pos.y+1]);
                if (this.pos.y === 1 && !pieces[[this.pos.x, this.pos.y+2]]) {
                    validmoves.push([this.pos.x, this.pos.y+2]);
                };
            };
            if (pieces[[this.pos.x+1, this.pos.y+1]]) {
                if (pieces[[this.pos.x+1, this.pos.y+1]].iswhite == !this.iswhite) {
                    validmoves.push([this.pos.x+1, this.pos.y+1])
                };
            };
            
            if (pieces[[this.pos.x-1, this.pos.y+1]]) {
                if (pieces[[this.pos.x-1, this.pos.y+1]].iswhite == !this.iswhite) {
                    validmoves.push([this.pos.x-1, this.pos.y+1])
                };
            };
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        let validmoves = [];
        if (this.iswhite) {
            validmoves.push([this.pos.x+1, this.pos.y-1])
            validmoves.push([this.pos.x-1, this.pos.y-1])        
        } else {
            validmoves.push([this.pos.x+1, this.pos.y+1])
            validmoves.push([this.pos.x-1, this.pos.y+1])
        };
        return validmoves;
    };

    ispromoted() {
        if(this.iswhite && this.pos.y === 0) {
            return true
        } else if (this.pos.y === 7) {
            return true
        };
        return false;
    };
};

class King extends Piece {
    constructor(...args) {
        super(...args);
        this.hasmoved = false;
    };

    getMoves() {
        let validmoves = [];
        let allvalidmoves = getallMoves(this.iswhite)
        let range;
        // so it castle if it hasn't moved yet
        if (this.hasmoved) {
            range = 1;
        } else {
            range = 2;
        }
        for (let i=-range; i<=range; i++) {
            for (let j=-1; j<=1; j++) {
                if (!(i===0 && j===0)) {
                    let x = this.pos.x + i;
                    let y = this.pos.y + j;
                    if (isonBoard(x, y) && !contains(allvalidmoves, [x, y])) {
                        if (!pieces[[x,y]] || pieces[[x,y]].iswhite === !this.iswhite) {
                            validmoves.push([x, y]);
                        };
                    };
                };
            };
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        let validmoves = [];
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                if (!(i===0 && j===0)) {
                    let x = this.pos.x + i;
                    let y = this.pos.y + j;
                    if (isonBoard(x, y)) {
                        if (!pieces[[x,y]] || pieces[[x,y]].iswhite === !this.iswhite) {
                            validmoves.push([x, y]);
                        };
                    };
                };
            };
        };
        return validmoves;
    };
};

class Queen extends Piece {
    constructor(...args) {
        super(...args);
    };
    getMoves() {
        let validmoves = [];
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                for (let k=1; k<=7; k++) {
                    if (!(i===0 && j===0)) {
                        let x = this.pos.x + i*k;
                        let y = this.pos.y + j*k;
                        if (isonBoard(x, y)) {
                            if (pieces[[x,y]]) {
                                if (pieces[[x,y]].iswhite !== this.iswhite) {
                                    validmoves.push([x, y]);
                                };
                                break;
                            };
                            validmoves.push([x, y]);
                        } else {
                            break;
                        };
                    };
                };
            };
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        //includes taking its own pieces so that the king cant take pieces under protection
        let validmoves = [];
        for (let i=-1; i<=1; i++) {
            for (let j=-1; j<=1; j++) {
                for (let k=1; k<=7; k++) {
                    if (!(i===0 && j===0)) {
                        let x = this.pos.x + i*k;
                        let y = this.pos.y + j*k;
                        if (isonBoard(x, y)) {
                            if (pieces[[x,y]]) {
                                validmoves.push([x, y]);
                                break;
                            };
                            validmoves.push([x, y]);
                        } else {
                            break;
                        };
                    };
                };
            };
        };
        return validmoves;
    };
};

class Bishop extends Piece {
    constructor(...args) {
        super(...args);
    };

    getMoves() {
        let validmoves = [];
        for (let i=-1; i<=1; i+=2) {
            for (let j=-1; j<=1; j+=2) {
                for (let k=1; k<=7; k++) {
                    if (!(i===0 && j===0)) {
                        let x = this.pos.x + i*k;
                        let y = this.pos.y + j*k;
                        if (isonBoard(x, y)) {
                            if (pieces[[x,y]]) {
                                if (pieces[[x,y]].iswhite !== this.iswhite) {
                                    validmoves.push([x, y]);
                                };
                                break;
                            };
                            validmoves.push([x, y]);
                        };
                    }
                };
            };
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        let validmoves = [];
        for (let i=-1; i<=1; i+=2) {
            for (let j=-1; j<=1; j+=2) {
                for (let k=1; k<=7; k++) {
                    if (!(i===0 && j===0)) {
                        let x = this.pos.x + i*k;
                        let y = this.pos.y + j*k;
                        if (isonBoard(x, y)) {
                            if (pieces[[x,y]]) {
                                validmoves.push([x, y]);
                                break;
                            };
                            validmoves.push([x, y]);
                        };
                    }
                };
            };
        };
        return validmoves;
    };
};

class Night extends Piece {
    constructor(...args) {
        super(...args);
    };

    getMoves() {
        let validmoves = [];
        let arr = [-2, 2, -1, 1];
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                if (Math.abs(arr[i]) !== Math.abs(arr[j])) {
                    let x = this.pos.x + arr[i];
                    let y = this.pos.y + arr[j];
                    if (isonBoard(x, y) && (!pieces[[x,y]] || pieces[[x,y]].iswhite == !this.iswhite)) {
                        validmoves.push([x, y]);
                    };
                };
            };
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        let validmoves = [];
        let arr = [-2, 2, -1, 1];
        for (let i=0; i<4; i++) {
            for (let j=0; j<4; j++) {
                if (Math.abs(arr[i]) !== Math.abs(arr[j])) {
                    let x = this.pos.x + arr[i];
                    let y = this.pos.y + arr[j];
                    if (isonBoard(x, y)) {
                        validmoves.push([x, y]);
                    };
                };
            };
        };
        return validmoves;
    }
};

class Rook extends Piece {
    constructor(...args) {
        super(...args);
    };

    getMoves() {
        let validmoves = [];
        for (let i=1; i<8-this.pos.x; i++) {
            let x = this.pos.x + i;
            let y = this.pos.y;
            if (pieces[[x, y]]) {
                if (pieces[[x,y]].iswhite !== this.iswhite) {
                    validmoves.push([x, y]);
                };
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<this.pos.x+1; i++) {
            let x = this.pos.x - i;
            let y = this.pos.y;
            if (pieces[[x, y]]) {
                if (pieces[[x,y]].iswhite !== this.iswhite) {
                    validmoves.push([x, y]);
                };
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<8-this.pos.y; i++) {    
            let x = this.pos.x;
            let y = this.pos.y + i;
            if (pieces[[x, y]]) {
                if (pieces[[x,y]].iswhite !== this.iswhite) {
                    validmoves.push([x, y]);
                };
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<this.pos.y+1; i++) {
            let x = this.pos.x;
            let y = this.pos.y - i;
            if (pieces[[x, y]]) {
                if (pieces[[x,y]].iswhite !== this.iswhite) {
                    validmoves.push([x, y]);
                };
                break;
            };
            validmoves.push([x, y]);
        };
        return validmoves;
    };

    gettheoreticalMoves() {
        let validmoves = [];
        for (let i=1; i<8-this.pos.x; i++) {
            let x = this.pos.x + i;
            let y = this.pos.y;
            if (pieces[[x, y]]) {
                validmoves.push([x, y]);
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<this.pos.x+1; i++) {
            let x = this.pos.x - i;
            let y = this.pos.y;
            if (pieces[[x, y]]) {
                validmoves.push([x, y]);
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<8-this.pos.y; i++) {    
            let x = this.pos.x;
            let y = this.pos.y + i;
            if (pieces[[x, y]]) {
                validmoves.push([x, y]);
                break;
            };
            validmoves.push([x, y]);
        };
        for (let i=1; i<this.pos.y+1; i++) {
            let x = this.pos.x;
            let y = this.pos.y - i;
            if (pieces[[x, y]]) {
                validmoves.push([x, y]);
                break;
            };
            validmoves.push([x, y]);
        };
        return validmoves;
    };
};

//class of the marker that displays the legal moves
class Marker {
    constructor(pos, onpiece) {
        this.pos = pos;
        this.onpiece = onpiece;
    };

    draw() {
        c.save();
        c.globalAlpha = 0.5;
        c.beginPath();
        c.fillStyle = 'red';
        let x = MARGIN.x + SS*this.pos[0] + SS/2;
        let y = MARGIN.y + SS*this.pos[1] + SS/2;

        let circlewidth = 5;

        if (this.onpiece) {
            this.radius = (SS-circlewidth)/2
        } else {
            this.radius = 10;
        };

        c.arc(x, y, this.radius, 0, Math.PI*2, false);
        
        if (!this.onpiece) {
            c.fillStyle = 'grey';
            c.fill();
        } else {
            c.lineWidth = circlewidth;
            c.strokeStyle = 'grey';
            c.stroke()
        };
        c.restore();
    }
};


//pieces
let pieces = {};
let whiteking;
let blackking;

//to display the legal moves of each piece
let markers = [];

// the selected piece
let clickedpiece;
let moves;

let iswhitesmove = true;
let checked;
let mated = false;


function setboard(iswhite) {
    let dic = {};
    //the beginning setup
    const chessPieces = [
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P']
    ];
    const chessClasses = {'P':Pawn, 'K':King, 'Q':Queen,'B':Bishop,'N':Night, 'R':Rook};

    //iterating trough the two rows
    for (let i=0; i < 2; i++) {
        //itetating trough the pieces in each row
        chessPieces[i].forEach((name, j) => {
            //if it is white it has to be on the other side
            let y = iswhite ? 7-i : i;
            dic[[j, y]] = new chessClasses[name]({ x : j, y : y }, name, iswhite)
        });
    };
    return dic
};

function init() {
    //initialising the game
    let whitepieces = setboard(true);
    let blackpieces = setboard(false);

    pieces = {
        ...whitepieces,
        ...blackpieces
    }

    whiteking = whitepieces[[4,7]];
    blackking = blackpieces[[4,0]];
};

function drawsquares() {
    //creating the board
    for (let i=0; i < 8; i++) {
        for (let j=0; j < 8; j++) {
            if (iswhitesmove && checked && i === whiteking.pos.x && j === whiteking.pos.y) {
                c.fillStyle = 'rgb(250, 132, 105)';
            } else if (!iswhitesmove && checked && i === blackking.pos.x && j === blackking.pos.y) {
                c.fillStyle = 'rgb(250, 132, 105)';
            } else if ((clickedpiece && i === clickedpiece.pos.x && j === clickedpiece.pos.y)) {
                c.fillStyle = 'rgb(181, 204, 100)';
            } else {
                c.fillStyle = (i+j)%2 === 0 ?   `hsl(67,17.2%,80.6%)` : `hsl(138, 21.3%, 56.7%)` ;
            };
            c.fillRect(MARGIN.x + SS*i, MARGIN.y + SS*j, SS, SS);
        };
    };
};

//animation

let animationId;
let score = 0;
function animate() {
    //incase the screen size changes
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    
    //the loop
    animationId =  requestAnimationFrame(animate);
    drawsquares();

    //drawing the markers
    markers.forEach(marker => {
        marker.draw();
    });

    //drawing all the pieces
    Object.values(pieces).forEach(piece => {
        piece.draw();
    });

    if (mated) {
        setTimeout(() => {
            cancelAnimationFrame(animationId);
            let won;
            if (iswhitesmove) {
                won = "Black";
            } else {
                won = "White";
            }
            alert(`Checkmate! ${won} wins!`);
        }, 0);
    }
};

init();
animate();
//event listeners - user imput

function incheck() {
    let allmoves = getallMoves(iswhitesmove);
    if (iswhitesmove) {
        return contains(allmoves, [whiteking.pos.x, whiteking.pos.y]);
    } else {
        return contains(allmoves, [blackking.pos.x, blackking.pos.y]);
    };
};


addEventListener('click', event => {
    //getting the position of the mouse on the board
    let mx = Math.floor((event.clientX - MARGIN.x)/SS);
    let my = Math.floor((event.clientY - MARGIN.y)/SS);
    
    //clearing the old markers
    markers = [];
    let ptemp = pieces[[mx, my]];
    if (ptemp && ptemp.iswhite == iswhitesmove) {
        //displaying the legal moves
        if (clickedpiece != ptemp) {

            clickedpiece = ptemp;
            moves = getfilteredMoves(clickedpiece);

            for (pos of moves) {
                markers.push(new Marker(pos, pieces[pos]));
            };


        } else {
            clickedpiece = null;
            ptemp = null;
            moves = [];
        };
    } else if (clickedpiece) {
        if (contains(moves, [mx,my])) {
            //if the king has moved change hasmoved to false so that the player cant castle anymore
            if (clickedpiece.constructor.name == "King") {
                clickedpiece.hasmoved = true;
            };

            //changing the position of the reverence in the array
            //changing the position of a piece
            delete pieces[[clickedpiece.pos.x, clickedpiece.pos.y]];
            clickedpiece.pos = {x: mx, y: my};
            pieces[[mx, my]] = clickedpiece;
            
            //promotion
            if (pieces[[mx, my]].constructor.name === 'Pawn') {
                if (pieces[[mx, my]].ispromoted()) {
                    pieces[[mx, my]] = new Queen({x:mx, y:my}, 'Q', pieces[[mx, my]].iswhite)
                };
            };
            

            clickedpiece = null;
            moves = [];

            //chaning the turn
            iswhitesmove = !iswhitesmove;

            //checking if the king is in check
            checked = incheck();

            //checking if mated
            let possibilities = [];
            Object.values(pieces).forEach((piece) => {
                if (piece.iswhite === iswhitesmove) {
                    let m = getfilteredMoves(piece);
                    if (m.length > 0) {
                        possibilities.push(m);
                    };
                };
            });
            
            if (incheck() && possibilities.length === 0) {
                mated = true;
            };

        } else {
            clickedpiece = null;
        };
    };    
});
