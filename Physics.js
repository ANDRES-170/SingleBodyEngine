const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const canvasWidth = canvas.width
const canvasHeight = canvas.height
const canvasBounds = canvas.getBoundingClientRect()

const infoTable = {
    infoPosX: document.getElementById("pos_x"),
    infoPosY: document.getElementById("pos_y"),
    infoVelX: document.getElementById("vel_x"),
    infoVelY: document.getElementById("vel_y"),
    infoAccX: document.getElementById("acc_x"),
    infoAccY: document.getElementById("acc_y"),
    infoCoef: document.getElementById("res_coef")
}

const settingsIndexTable = {
    setPosX: document.getElementById("set_pos_x"),
    setPosY: document.getElementById("set_pos_y"),
    setVelX: document.getElementById("set_vel_x"),
    setVelY: document.getElementById("set_vel_y"),
    setAccX: document.getElementById("set_acc_x"),
    setAccY: document.getElementById("set_acc_y"),
    setCoef: document.getElementById("set_res_coef"),
}

const settingsActionTable = {
    setPosXVal: document.getElementById("set_pos_x_value"),
    setPosYVal: document.getElementById("set_pos_y_value"),
    setVelXVal: document.getElementById("set_vel_x_value"),
    setVelYVal: document.getElementById("set_vel_y_value"),
    setAccXVal: document.getElementById("set_acc_x_value"),
    setAccYVal: document.getElementById("set_acc_y_value"),
    setCoefVal: document.getElementById("set_res_coef_value"),
    setReset: document.getElementById("set_reset_button"),
    setApply: document.getElementById("set_apply_button")
}

var createdSprites = []

const soundBank = {
    collSnd01: new Audio("Coll1.ogg")
}

var borderMargin = 10;

var restitutionCoef = 1;

//import * as engine from "engine.js"
//import { degToRad, Matrix, Vector } from "./engine"

function degToRad(angle) {
    pi = Math.PI
    return angle*(pi/180)
}

function radToDeg(angle) {
    pi = Math.PI
    return angle*(180/pi)
}

class Vector {
    constructor(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    verifyInput(v) {
        if (v instanceof Vector) {
            return true
        } else {
            return false
        }
    }

    add(v = new Vector()) {
        return new Vector(this.x + v.x, this.y + v.y)
    }

    subtract(v = new Vector()) {
        return new Vector(this.x - v.x, this.y - v.y)
    }

    magnitude() {
        //let mag = Math.sqrt(this.x**2,this.y**2)
        let mag = Math.hypot(this.x, this.y);
        return mag
    }

    scalarMultiply(k = 1) {
        return new Vector(k*this.x, k*this.y)
    } 

    normalize() {
        let unit = this.magnitude()
        let out_x = this.x / unit
        let out_y = this.y / unit
        return new Vector(out_x, out_y)
    }

    dotProduct(v = new Vector()) {
        return ((this.x * v.x)+(this.y * v.y))
    }

    crossProduct(v = new Vector()) {
        //Same as a determinant of a 2x2 Matrix
        return (this.x * v.y - this.y * v.x)
    }

    newCoords(x = 0, y = 0) {
        this.x = x
        this.y = y
    }

    getAngle() {
        //return Math.acos((this.dotProduct(left))/((this.magnitude())*(left.magnitude())))
        return Math.atan2(this.x, -this.y)
    }

    angleDifference(v) {
        //return Math.acos((this.dotProduct(v))/((this.magnitude())*(v.magnitude())))
        //Formula to use with atan2 stolen from https://www.jwwalker.com/pages/angle-between-vectors.html
        return Math.atan2(this.crossProduct(v),-this.dotProduct(v))
    }

    print() {
        return {x: this.x, y: this.y}
    }

    asArray() {
        //let output = new Array()
        return [this.x, this.y]
    }

    asMatrix() {
        let vec = new Matrix(2,1)
        vec.setValue(0,0,this.x)
        vec.setValue(1,0,this.y)
        return vec
    }
}

class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.mat = this.init();        
    }

    init() {
        const mat = new Array
        for (let i = 0; i < this.rows; i++) {
            mat.push([])
            for (let j = 0; j < this.cols; j++) {
                mat[i].push([])
                mat[i][j] = 0                
            }
        }
        return mat
    }

    getValue(col, row) {
        return this.mat[col][row]
    }

    setValue(col, row, value) {
        if (isNaN(value)) {
            return console.error("Input Value is Invalid")
        }
        
        this.mat[col][row] = value        
    }

    print() {
        return this.mat
    }

    isSquare() {
        return this.cols === this.rows
    }

    transpose() {
        /*if (this.isSquare != true) {
            console.log("Matrix is not Square")
        }*/
        let temp = new Array
        temp = this.init()
        //matrix overwrites the transpose variable when initializated from the original matrix
        //temp = this.mat

        for (let i = 0; i < this.mat.length; i++) {
            for (let j = 0; j < this.mat[i].length; j++) {
                temp[i][j] = this.mat[j][i]
                
            }
        }
        return temp
    }

    determinant() {

    }

}

class Sprite {
    constructor(x = 0, y = 0, /*width = 0, height = 0,*/ src = "null.png", isSpriteSheet = false, frames = 1) {
        //this.width = width
        //this.height = height
        this.width = 0
        this.height = 0
        this.img = new Image(this.width, this.height)
        this.img.src = src
        this.angle = 0
        this.isSpriteSheet = isSpriteSheet
        this.frames = frames
        this.speed = 0
        this.origin = new Vector()
        this.init()
        this.pos = new Vector(this.origin.x + x, this.origin.y + y)
        this.scale = new Vector(1, 1)
    }

    init() {
        createdSprites.push(this)
    }

    setSpriteAngle(angle) {
        this.angle = angle
    }

    draw() {
        ctx.save()
        ctx.translate(this.pos.x, this.pos.y)
        ctx.translate(this.origin.x, this.origin.y)
        ctx.rotate(this.angle)
        //ctx.drawImage(this.img, this.pos.x, this.pos.y)
        ctx.drawImage(this.img, -this.origin.x, -this.origin.y)
        //ctx.translate(this.pos.x - this.origin.x, this.pos.y - this.origin)
        ctx.restore()
    }
}

/*
class Instance {
    constructor(x = 0, y = 0) {
        this.position = new Vector(this.x, this.y)
        this.velocity = new Vector()
        this.sprite = new Sprite
        this.direction = 0   
    }

    setDirection(angle) {
        this.direction = angle
    }

    setSprite(spr) {
        if (spr.constructor.name !== "Sprite") {
            return "Argument is not recognized as Sprite"
        }

        this.sprite = spr
    }

    draw() {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.translate(this.sprite.origin.x, this.sprite.origin.y)
        ctx.rotate(this.direction)
        ctx.drawImage(this.sprite.img, -this.sprite.origin.x, -this.sprite.origin.y)
        ctx.restore()
    }
}
*/

class Instance {
    constructor(x = 0, y = 0) {
        this.position = new Vector(this.x, this.y)
        this.velocity = new Vector()
        this.sprite = new Sprite
        this.direction = 0   
    }

    setDirection(angle) {
        this.direction = angle
    }

    setSprite(spr) {
        if (spr.constructor.name !== "Sprite") {
            return "Argument is not recognized as Sprite"
        }

        this.sprite = spr
    }

    draw() {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.translate(this.sprite.origin.x, this.sprite.origin.y)
        ctx.rotate(this.direction)
        ctx.drawImage(this.sprite.img, -this.sprite.origin.x, -this.sprite.origin.y)
        ctx.restore()
    }
}

class dynamicBody {
    constructor(x = 0, y = 0, mass, size) {
        this.position = new Vector(this.x, this.y)
        this.velocity = new Vector()
        this.acceleration = new Vector()
        this.sprite = new Sprite
        this.direction = 0   
        this.mass = mass
        this.size = size
        this.isAirbourne = true
        this.sound = true
    }

    setDirection(angle) {
        this.direction = angle
    }

    setSprite(spr) {
        if (spr.constructor.name !== "Sprite") {
            return "Argument is not recognized as Sprite"
        }

        this.sprite = spr
    }

    draw() {
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        //ctx.translate(this.sprite.origin.x, this.sprite.origin.y)
        ctx.rotate(this.direction)
        //ctx.drawImage(this.sprite.img, -this.sprite.origin.x, -this.sprite.origin.y)
        ctx.beginPath();
        //ctx.rect(-this.sprite.origin.x - this.size, -this.sprite.origin.y - this.size, this.sprite.origin.x + this.size, this.sprite.origin.y + this.size)
        ctx.rect(-this.sprite.origin.x - this.size, -this.sprite.origin.y - this.size, this.sprite.origin.x + this.size, this.sprite.origin.y + this.size)
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.closePath();
        ctx.restore()
    }

    processPhysical() {
        this.position.x += this.velocity.x
        this.position.y -= this.velocity.y
        this.velocity.x += this.acceleration.x
        this.velocity.y += this.acceleration.y


    }

    

    checkCollision() {
        
        console.log(this.sound);

        if (body.velocity.magnitude() > 1 && restitutionCoef < 1) {
            body.isAirbourne = true
        }
        
        //Origin at Bottom Right
        //ctx.clearRect(borderMargin, borderMargin, canvasWidth - borderMargin*2, canvasHeight - borderMargin*2)
        if (this.isAirbourne == true) {
            if (this.position.x >= canvasWidth - borderMargin) {
                this.velocity.x *= -restitutionCoef
                
            }

            if (this.position.x <= borderMargin * 2) {
                this.velocity.x *= -restitutionCoef
                
            }

            if (this.position.y >= canvasHeight - borderMargin) {
                this.velocity.y *= -restitutionCoef
                
            }

            if (this.position.y <= borderMargin * 2) {
                this.velocity.y *= -restitutionCoef
                
            }
        }
    }

    resetBody() {
        this.acceleration.x = 0
        this.acceleration.y = 0
    }
}

class staticBody extends Instance {
    constructor() {
        
    }

    processPhysical() {

    }
}

const up = new Vector(0,1)
const down = new Vector(0,-1)
const left = new Vector(1,0)
const right = new Vector(-1,0)

function pointDirection(x1, y1, x2, y2) {
    vec = new Vector(x2 - x1, y2 - y1)
    return vec.getAngle()
}



//var createdSprites = []
//const img = new Image(1024,1024)
//img.src = "Car.png"


const mouse = {
    x: 0,
    y: 0,
    lmb: false,
    rmb: false,
    mmb: false,
    coords: new Vector(this.x, this.y)
}


function updateMouse() {
    document.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX - canvasBounds.left
        mouse.y = e.clientY - canvasBounds.top
        mouse.coords.newCoords(mouse.x, mouse.y)
        //console.log(mouse.x, mouse.y);
        
    })
}

function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
 
    ctx.save();
    ctx.strokeStyle = color;
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
               toy-headlen*Math.sin(angle+Math.PI/7));
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}







/*
function createSprite(name, width, height, src) {

    const name = new Image(width, height)
    name.src = src
    createdSprites.push(name)
};

function drawSprite(name, x, y) {
    return ctx.drawImage(name, x, y);
}
*/

/*
function rotateImage(angle) {
    angle = angle*(Math.PI/180)
    ctx.save()
    ctx.translate(1024/2,1024/2)
    ctx.rotate(angle)
    ctx.drawImage(img,-1024/2,-1024/2)
    ctx.restore()
}
*/

const gravity = new Vector(0,-9.81)

let time = 0

//ctx.fillStyle 

const test = new Sprite()
test.width = 32
test.height = 32
test.origin.newCoords(16,16)
test.pos.newCoords(128,128)
test.img.src = "normal.png"

const obj = new Instance()
obj.sprite = test

const bullet = new Instance()
bullet.position.newCoords(128, 128)
bullet.sprite = test


const body = new dynamicBody(canvasWidth/2,canvasHeight/2,1,1)
body.position.newCoords(canvasWidth/2,canvasHeight/2)
body.setSprite(test)

async function setProperties() {
    console.log(parseFloat(settingsActionTable.setPosXVal.value),
        parseFloat(settingsActionTable.setPosYVal.value),
        parseFloat(settingsActionTable.setVelXVal.value),
        parseFloat(settingsActionTable.setVelYVal.value),
        parseFloat(settingsActionTable.setAccXVal.value),
        parseFloat(settingsActionTable.setAccYVal.value),
        parseFloat(settingsActionTable.setCoefVal.value));

    if (isNaN(parseFloat(settingsActionTable.setPosXVal.value)) || settingsActionTable.setPosXVal.value === undefined) {
        body.position.x = body.position.x
    } else {
        body.position.x = parseFloat(settingsActionTable.setPosXVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setPosYVal.value)) || settingsActionTable.setPosYVal.value === undefined) {
        body.position.y = body.position.y
    } else {
        body.position.y = parseFloat(settingsActionTable.setPosYVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setVelXVal.value)) || settingsActionTable.setVelXVal.value === undefined) {
        body.velocity.x = body.velocity.x
    } else {
        body.velocity.x = parseFloat(settingsActionTable.setVelXVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setVelYVal.value)) || settingsActionTable.setVelYVal.value === undefined) {
        body.velocity.y = body.velocity.y
    } else {
        body.velocity.y = parseFloat(settingsActionTable.setVelYVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setAccXVal.value)) || settingsActionTable.setAccXVal.value === undefined) {
        body.acceleration.x = body.acceleration.x
    } else {
        body.acceleration.x = parseFloat(settingsActionTable.setAccXVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setAccYVal.value)) || settingsActionTable.setAccYVal.value === undefined) {
        body.acceleration.y = body.acceleration.y
    } else {
        body.acceleration.y = parseFloat(settingsActionTable.setAccYVal.value)
    }

    if (isNaN(parseFloat(settingsActionTable.setCoefVal.value)) || settingsActionTable.setCoefVal.value === undefined) {
        restitutionCoef = restitutionCoef
    } else {
        restitutionCoef = parseFloat(settingsActionTable.setCoefVal.value)
    }

    /*
    body.position.x = parseFloat(settingsActionTable.setPosXVal.value)
    body.position.y = parseFloat(settingsActionTable.setPosYVal.value)
    body.velocity.x = parseFloat(settingsActionTable.setVelXVal.value)
    body.velocity.y = parseFloat(settingsActionTable.setVelYVal.value)
    body.acceleration.x = parseFloat(settingsActionTable.setAccXVal.value)
    body.acceleration.y = parseFloat(settingsActionTable.setAccYVal.value)
    body.restitutionCoef = parseFloat(settingsActionTable.setCoefVal.value)
    */

    
}

drawArrow(ctx, body.position.x, body.position.y, body.position.x + body.velocity.x, body.position.y + body.velocity.y, 5, "red")
settingsActionTable.setApply.addEventListener("click", setProperties)

async function update() {
    
    body.processPhysical()
    body.checkCollision()
    
    
    //requestAnimationFrame(update)
    //draw()
}

async function fixedUpdate() {
    //console.log(test.setSpriteAngle(pointDirection(test.x, mouse.x, test.y, mouse.y)));
    //console.log(test.origin.x + test.pos.x, test.origin.y + test.pos.y)
    //console.log(-test.origin.x - test.pos.x, -test.origin.y - test.pos.y)


    infoTable.infoPosX.innerText = "Position X: " + Math.trunc(body.position.x*100)/100
    infoTable.infoPosY.innerText = "Position Y: " + Math.trunc(body.position.y*100)/100
    infoTable.infoVelX.innerText = "Velocity X: " + Math.trunc(body.velocity.x*100)/100
    infoTable.infoVelY.innerText = "Velocity Y: " + Math.trunc(body.velocity.y*100)/100
    infoTable.infoAccX.innerText = "Acceleration X: " + Math.trunc(body.acceleration.x*100)/100
    infoTable.infoAccY.innerText = "Acceleration Y: " + Math.trunc(body.acceleration.y*100)/100
    infoTable.infoCoef.innerText = "Restitution Coefficient (µ): " + Math.trunc(restitutionCoef*100)/100

}

async function draw() {    
    //ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#0000FF";
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.closePath();

    ctx.beginPath()
    ctx.clearRect(borderMargin, borderMargin, canvasWidth - borderMargin*2, canvasHeight - borderMargin*2)
    ctx.closePath()
    body.draw()
    time++
    
    
    requestAnimationFrame(draw) 
}
//requestAnimationFrame(draw)
//requestAnimationFrame(update)

draw()
update()

setInterval(fixedUpdate,500)
setInterval(update,1000/60)
setInterval(updateMouse,5000)
setInterval(draw,1000/60)












