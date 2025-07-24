interface Point {
    x: number,
    y: number
}

interface Stroke {
    startX: number,
    startY: number,
    endX: number,
    endY: number,
}

type Line = Stroke[];
type Shapes = Line[];




export class GameLogicClass {
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private currentTool:string="pen";
    private isDrawing:boolean=false;
    private isErasing:boolean=false;
    private startPoint:Point = {x:0,y:0};
    private intermediateStroke:Stroke[] = []
    private shapeStore:Shapes = []

    constructor(canvas:HTMLCanvasElement, ctx: CanvasRenderingContext2D, currentTool:string) {
        this.canvas=canvas;
        this.ctx=ctx;
        this.currentTool=currentTool;
        this.setCanvasAttributes();
        this.attachEventListeners();
        this.loadStoredShapes();
    }

    private setCanvasAttributes = () => {
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
        this.ctx.strokeStyle = "red"
        this.ctx.lineWidth = 2;           // Set stroke thickness
        this.ctx.lineJoin = 'round';      // Smooth corners
        this.ctx.lineCap = 'round';  
    }
    
    private loadStoredShapes = () => {
        const localStorageShapes = localStorage.getItem("Shapes");
        if(localStorageShapes) {
            const parsedLocalStorageShapes = JSON.parse(localStorageShapes);

            this.shapeStore.push(...parsedLocalStorageShapes)

            this.draw_stored_shapes()
        }
    }

    private draw_stored_shapes = () => {
        this.shapeStore.map((line) => {
            line.map((str) => {
                this.ctx.beginPath();
                this.ctx.moveTo(str.startX, str.startY);
                this.ctx.lineTo(str.endX, str.endY);
                this.ctx.stroke();
            })
        })
    }

    private attachEventListeners = () => {
        this.canvas.addEventListener("mousedown", this.handleMouseDown);
        this.canvas.addEventListener("mousemove", this.handleMouseMove);
        this.canvas.addEventListener("mouseup", this.handleMouseUp);
        this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
    }

    private getMousePos = (evt:MouseEvent):Point => {
        return {
            x: evt.clientX,
            y: evt.clientY
        }
    }

    private isStrokeNearEraser = (x:number, y:number, stroke:Stroke, radius:number) => {
        const { startX, startY, endX, endY } = stroke;

        const dx = endX - startX;
        const dy = endY - startY;

        // Handle case where start and end are the same point (zero-length stroke)
        if (dx === 0 && dy === 0) {
            const dist = Math.hypot(x - startX, y - startY);
            return dist <= radius;
        }

        // Project point onto the line, then clamp to segment
        const t = ((x - startX) * dx + (y - startY) * dy) / (dx * dx + dy * dy);
        const clampedT = Math.max(0, Math.min(1, t));

        const closestX = startX + clampedT * dx;
        const closestY = startY + clampedT * dy;

        const distance = Math.hypot(x - closestX, y - closestY);
        return distance <= radius;
    }

    private checkLineNearToEraser = (line: Line, eraserPoint: Point):boolean => {
        // here we check for each stroke
        // how does a line look like: [stroke];
        for(let i=0;i<line.length;i++) {
            const stroke:Stroke = line[i];
            if(this.isStrokeNearEraser(eraserPoint.x, eraserPoint.y, stroke, 10)) {
                return true;
            }
        }
        return false;
    }

    private handleMouseDown = (e:MouseEvent) => {
        if(!this.ctx||!this.canvas) {
            return;
        }
        // here we need to write and update booleans based on current tool;
        if(this.currentTool=="Pen") {
            // User wants to draw
            this.isDrawing = true
            const mousePos = this.getMousePos(e);

            this.ctx.beginPath();
            // this becomes our start point for one of the lineStroke

            this.startPoint.x = mousePos.x;
            this.startPoint.y = mousePos.y;
            
            this.ctx.moveTo(mousePos.x, mousePos.y);
        }else if(this.currentTool == "Eraser") {
            // User wants to erase
            this.isErasing = true;
            const mousePos = this.getMousePos(e);

            for(let i = 0; i<this.shapeStore.length;i++) {

                const line = this.shapeStore[i];
                const lineIsNearToEraser:boolean = this.checkLineNearToEraser(line, mousePos);
                if(lineIsNearToEraser) {
                    console.log("Erasing");
                    console.log(this.shapeStore.length);
                    this.shapeStore.splice(i,1);
                    console.log("Erasing completed");
                    console.log(this.shapeStore.length);
                }
            }
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
            this.draw_stored_shapes();
        }
    }
    private handleMouseMove = (e:MouseEvent) => {
        if(!this.ctx||!this.canvas) return;
        if(this.isDrawing) {
            // handle logic for drawing
            const mousePos = this.getMousePos(e);   
            // this mousePos becomes our end for old startPoint and start for new startPoint
            // renderScreen(); **
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.intermediateStroke.push({
                startX: this.startPoint.x,
                startY: this.startPoint.y,
                endX: mousePos.x,
                endY: mousePos.y,
                
            })
            this.ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
            this.ctx.stroke();   

            this.ctx.beginPath();
            
            this.startPoint.x = mousePos.x;
            this.startPoint.y = mousePos.y;
            this.ctx.moveTo(mousePos.x, mousePos.y);
        }else if(this.isErasing) {
            // handle logic for erasing
            const mousePos = this.getMousePos(e);

            for(let i = 0; i<this.shapeStore.length;i++) {

                const line = this.shapeStore[i];
                const lineIsNearToEraser:boolean = this.checkLineNearToEraser(line, mousePos);
                if(lineIsNearToEraser) {

                    console.log("Erasing");
                    console.log(this.shapeStore.length);
                    this.shapeStore.splice(i,1);
                    console.log("Erasing completed");
                    console.log(this.shapeStore.length);
                }
            }
            this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height)
            this.draw_stored_shapes();
        }

    }
    private handleMouseUp = (e:MouseEvent) => {
        if(!this.ctx) return;
        if(this.isDrawing) {
            // handle logic for drawing end
            this.isDrawing = false;
            const mousePos = this.getMousePos(e);   
            this.intermediateStroke.push({
                startX: this.startPoint.x,
                startY: this.startPoint.y,
                endX: mousePos.x,
                endY: mousePos.y,
                
            })
            this.ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
            // this.ctx.quadraticCurveTo(this.startPoint.x, this.startPoint.y, mousePos.x, mousePos.y);
            this.ctx.stroke();
            
            this.shapeStore.push(this.intermediateStroke);
            this.intermediateStroke = [];
            console.log(this.shapeStore);
            localStorage.setItem("Shapes", JSON.stringify(this.shapeStore));
        }else if(this.isErasing) {
            // handle logic for erasing end
            // here we need to update localstorage as well
            localStorage.setItem("Shapes", JSON.stringify(this.shapeStore));
            this.isErasing = false;
        }
    }

    private clearMouseHandlers = () => {
        this.canvas.removeEventListener("mousedown", this.handleMouseDown);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("mouseup", this.handleMouseUp);
        this.canvas.removeEventListener("mouseleave", this.handleMouseUp);
    }

    public destroy = () => {
        this.clearMouseHandlers();
    }
}


