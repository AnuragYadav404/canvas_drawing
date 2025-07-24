import { useEffect, useRef, useState } from "react"

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

export function HandEraserCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTool, setCurrentTool] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas?.getContext("2d");
        if(!ctx) return;

        let isDrawing = false;
        let isErasing = false;
        const startPoint:Point = {x:0,y:0}
        let intermediateStroke:Stroke[] = []
        const shapeStore:Shapes = []

        setCanvasAttributes(canvas, ctx);

        function setCanvasAttributes(canvas: HTMLCanvasElement, ctx:CanvasRenderingContext2D) {
            canvas.height = window.innerHeight;
            canvas.width = window.innerWidth;

            ctx.strokeStyle = "red"
            ctx.lineWidth = 2;           // Set stroke thickness
            ctx.lineJoin = 'round';      // Smooth corners
            ctx.lineCap = 'round';  
        }

        attachEventListeners(canvas);
        function attachEventListeners(canvas: HTMLCanvasElement) {
            canvas.addEventListener("mousedown", handleMouseDown);
            canvas.addEventListener("mousemove", handleMouseMove);
            canvas.addEventListener("mouseup", handleMouseUp);
            canvas.addEventListener("mouseleave", handleMouseLeave);
        }

        loadStoredShapes();

        function loadStoredShapes() {
            const localStorageShapes = localStorage.getItem("Shapes");
            if(localStorageShapes) {
                const parsedLocalStorageShapes = JSON.parse(localStorageShapes);

                shapeStore.push(...parsedLocalStorageShapes)

                draw_stored_shapes()
            }
        }

        function draw_stored_shapes() {
            shapeStore.map((line) => {
                line.map((str) => {
                    ctx?.beginPath();
                    ctx?.moveTo(str.startX, str.startY);
                    ctx?.lineTo(str.endX, str.endY);
                    ctx?.stroke();
                })
            })
        }

        function getMousePos(evt:MouseEvent):Point {
            return {
                x: evt.clientX,
                y: evt.clientY
            }
        }

        function isStrokeNearEraser(x:number, y:number, stroke:Stroke, radius:number) {
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

        function checkLineNearToEraser(line: Line, eraserPoint: Point):boolean {
            // here we check for each stroke
            // how does a line look like: [stroke];
            for(let i=0;i<line.length;i++) {
                const stroke:Stroke = line[i];
                if(isStrokeNearEraser(eraserPoint.x, eraserPoint.y, stroke, 10)) {
                    return true;
                }
            }
            return false;
        }

        function handleMouseDown(e: MouseEvent) {
            if(!ctx||!canvas) {
                return;
            }
            // here we need to write and update booleans based on current tool;
            if(currentTool=="Pen") {
                // User wants to draw
                isDrawing = true
                const mousePos = getMousePos(e);

                ctx.beginPath();
                // this becomes our start point for one of the lineStroke

                startPoint.x = mousePos.x;
                startPoint.y = mousePos.y;
                
                ctx.moveTo(mousePos.x, mousePos.y);
            }else if(currentTool == "Eraser") {
                // User wants to erase
                isErasing = true;
                const mousePos = getMousePos(e);

                for(let i = 0; i<shapeStore.length;i++) {

                    const line = shapeStore[i];
                    const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                    if(lineIsNearToEraser) {
                        console.log("Erasing");
                        console.log(shapeStore.length);
                        shapeStore.splice(i,1);
                        console.log("Erasing completed");
                        console.log(shapeStore.length);
                    }
                }
                ctx.clearRect(0,0,canvas.width, canvas.height)
                draw_stored_shapes();
            }

        }
        function handleMouseMove(e: MouseEvent) {
            if(!ctx||!canvas) return;
            if(isDrawing) {
                // handle logic for drawing
                const mousePos = getMousePos(e);   
                // this mousePos becomes our end for old startPoint and start for new startPoint
                // renderScreen(); **
                // ctx.clearRect(0, 0, canvas.width, canvas.height);
                intermediateStroke.push({
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: mousePos.x,
                    endY: mousePos.y,
                    
                })
                ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
                ctx.stroke();   

                ctx.beginPath();
                
                startPoint.x = mousePos.x;
                startPoint.y = mousePos.y;
                ctx.moveTo(mousePos.x, mousePos.y);
            }else if(isErasing) {
                // handle logic for erasing
                const mousePos = getMousePos(e);

                for(let i = 0; i<shapeStore.length;i++) {

                    const line = shapeStore[i];
                    const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                    if(lineIsNearToEraser) {

                        console.log("Erasing");
                        console.log(shapeStore.length);
                        shapeStore.splice(i,1);
                        console.log("Erasing completed");
                        console.log(shapeStore.length);
                    }
                }
                ctx.clearRect(0,0,canvas.width, canvas.height)
                draw_stored_shapes();
            }


        }
        function handleMouseUp(e: MouseEvent) {
            if(!ctx) return;
            if(isDrawing) {
                // handle logic for drawing end
                isDrawing = false;
                const mousePos = getMousePos(e);   
                intermediateStroke.push({
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: mousePos.x,
                    endY: mousePos.y,
                    
                })
                ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
                // ctx.quadraticCurveTo(startPoint.x, startPoint.y, mousePos.x, mousePos.y);
                ctx.stroke();
                
                shapeStore.push(intermediateStroke);
                intermediateStroke = [];
                console.log(shapeStore);
                localStorage.setItem("Shapes", JSON.stringify(shapeStore));
            }else if(isErasing) {
                // handle logic for erasing end
                // here we need to update localstorage as well
                localStorage.setItem("Shapes", JSON.stringify(shapeStore));
                isErasing = false;
            }

        }

        function handleMouseLeave(e: MouseEvent) {
            if(!ctx) return;
            if(isDrawing) {
                // handle logic for drawing end
                isDrawing = false;
                const mousePos = getMousePos(e);   
                intermediateStroke.push({
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: mousePos.x,
                    endY: mousePos.y,
                    
                })
                ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
                // ctx.quadraticCurveTo(startPoint.x, startPoint.y, mousePos.x, mousePos.y);
                ctx.stroke();
                
                shapeStore.push(intermediateStroke);
                intermediateStroke = [];
                console.log(shapeStore);
                localStorage.setItem("Shapes", JSON.stringify(shapeStore));
            }else if(isErasing) {
                // handle logic for erasing end
                // here we need to update localstorage as well
                localStorage.setItem("Shapes", JSON.stringify(shapeStore));
                isErasing = false;
            }

        }
 
        function clearMouseHandlers(canvas: HTMLCanvasElement) {
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseup", handleMouseUp);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            console.log("clearing events")
            clearMouseHandlers(canvas)
            
        }


    }, [currentTool])

    return (
        <div>
            <canvas ref={canvasRef} className="h-screen w-screen bg-black"></canvas>
            <div className="fixed top-0 left-0 bg-black">
                <button className="p-2 m-2 rounded-r-2xl text-white border-zinc-400 border-2 hover:bg-zinc-600 " onClick={(e) => setCurrentTool("Pen")}>Pen</button>
                <button className="p-2 m-2 rounded-r-2xl  text-white border-zinc-400 border-2 hover:bg-zinc-600 " onClick={(e) => setCurrentTool("Eraser")}>Eraser</button>
            </div>
        </div>
    )
}