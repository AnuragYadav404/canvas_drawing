import { useEffect, useRef } from "react"

// interface shape {
//     startX: number,
//     startY: number,
//     endX: number,
//     endY: number;
// }


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

export function HandCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas){
            return;
        }
        const ctx = canvas?.getContext("2d");
        if(!ctx) {
            return;
        }

        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        ctx.strokeStyle = "red"
        ctx.lineWidth = 2;           // Set stroke thickness
        ctx.lineJoin = 'round';      // Smooth corners
        ctx.lineCap = 'round';       // Smooth ends of lines
        ctx.strokeStyle = 'red';    // Choose a consistent stroke color
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
        // ctx.strokeStyle = '#000';



        const shapeStore:Shapes = [];

        let intermediateStroke:Stroke[] = []
        const startPoint: Point = {
            x: 0,
            y: 0
        }

        const localStorageShapes = localStorage.getItem("Shapes");
        if(localStorageShapes) {
            const parsedLocalStorageShapes = JSON.parse(localStorageShapes);
            shapeStore.push(...parsedLocalStorageShapes)
            draw_stored_shapes(parsedLocalStorageShapes)
        }

        function draw_stored_shapes(shapes: Shapes) {
            shapes.map((line) => {
                
                line.map((str) => {
                    ctx?.beginPath();
                    ctx?.moveTo(str.startX, str.startY);
                    ctx?.lineTo(str.endX, str.endY);
                    ctx?.stroke();
                })
            })
        }

        let isDrawing:boolean = false;

        function getMousePos(evt:MouseEvent) {
            return {
                x: evt.clientX,
                y: evt.clientY
            }
        }

        canvas.addEventListener("mousedown", (e) => {
            // here we start drawing and recording as well
            isDrawing = true;
            const mousePos = getMousePos(e);

            ctx.beginPath();
            // this becomes our start point for one of the lineStroke

            startPoint.x = mousePos.x;
            startPoint.y = mousePos.y;
            
            ctx.moveTo(mousePos.x, mousePos.y);
            
            // intermediateStroke.push(mousePos);
            // ctx.strokeRect(mousePos.x, mousePos.y, 5, 5)
        })

        canvas.addEventListener("mousemove", (e) => {
            if(isDrawing) {
                const mousePos = getMousePos(e);   
                // this mousePos becomes our end for old startPoint and start for new startPoint
                renderScreen();
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
                // intermediateStroke.push(mousePos);
                // ctx.strokeRect(mousePos.x, mousePos.y, 10, 10)
            }
        })

        canvas.addEventListener("mouseup", (e) => {
            if(isDrawing) {
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
                // const mousePos = getMousePos(e);
                // intermediateStroke.push(mousePos);
                // ctx.strokeRect(mousePos.x, mousePos.y, 5, 5)
            }
        })

        canvas.addEventListener("mouseleave", (e) => {
            if(isDrawing) {
                isDrawing = false;
                const mousePos = getMousePos(e);   
                intermediateStroke.push({
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: mousePos.x,
                    endY: mousePos.y,
                    
                })
                ctx.lineTo(mousePos.x, mousePos.y);    // Draw a line to the new point
                ctx.stroke();
                
                shapeStore.push(intermediateStroke);
                intermediateStroke = [];
                console.log(shapeStore);
                localStorage.setItem("Shapes", JSON.stringify(shapeStore));
                // const mousePos = getMousePos(e);
                // intermediateStroke.push(mousePos);
                // ctx.strokeRect(mousePos.x, mousePos.y, 5, 5)
            }
        })

        function renderScreen() {
            if(!ctx || !canvas) return

            // ctx.clearRect(0,0,canvas.width, canvas.height);
            // shapeStore.map((shp) => {
            //     shp.map((str) => {

            //     })
            // })
        }

    }, [])

    return (
        <div>
            <canvas ref={canvasRef} className="h-screen w-screen bg-black"></canvas>
        </div>
    )
}