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

export function EraserCanvas() {
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

        const shapeStore:Shapes = []

        const localStorageShapes = localStorage.getItem("Shapes");
        if(localStorageShapes) {
            const parsedLocalStorageShapes = JSON.parse(localStorageShapes);
            // console.log(parsedLocalStorageShapes.length)
            shapeStore.push(...parsedLocalStorageShapes)
            // console.log("parsed: ",parsedLocalStorageShapes)
            draw_stored_shapes()
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

        let isErasing = false;


        function getMousePos(evt:MouseEvent):Point {
            return {
                x: evt.clientX,
                y: evt.clientY
            }
        }

        function isStrokeNearEraser(x:number, y:number, stroke:Stroke, radius:number) {
            const { startX, startY, endX, endY } = stroke;

            //
            const dx = endX - startX;
            const dy = endY - startY;

            // Avoid divide by zero
            if (dx === 0 && dy === 0) {
                const dist = Math.hypot(x - startX, y - startY);
                return dist <= radius;
            }

            // Project point onto the line, then clamp to segment
            const t = ((x - startX) * dx + (y - startY) * dy) / (dx * dx + dy * dy);
            const clampedT = Math.max(0, Math.min(1, t)); // Clamp t to segment

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

        canvas.addEventListener("mousedown", (e)=> {
            isErasing = true;
            const mousePos = getMousePos(e);
            console.log("shape store has no of shapes: ",shapeStore.length);
            for(let i = 0; i<shapeStore.length;i++) {
                console.log("checking")
                const line = shapeStore[i];
                const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                if(lineIsNearToEraser) {
                    console.log("delete")
                    shapeStore.splice(i,1);
                }else {
                    console.log("dont delete")
                }
            }
            ctx.clearRect(0,0,canvas.width, canvas.height)
            draw_stored_shapes();
        })

        canvas.addEventListener("mousemove", (e) => {
            if(isErasing) {
                const mousePos = getMousePos(e);
                console.log("shape store has no of shapes: ",shapeStore.length);
                for(let i = 0; i<shapeStore.length;i++) {
                    console.log("checking")
                    const line = shapeStore[i];
                    const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                    if(lineIsNearToEraser) {
                        console.log("delete")
                        shapeStore.splice(i,1);
                    }else {
                        console.log("dont delete")
                    }
                }
                ctx.clearRect(0,0,canvas.width, canvas.height)
                draw_stored_shapes();
            }
        })

        canvas.addEventListener("mouseup", (e) =>{
            isErasing = false;
        })

        canvas.addEventListener("mouseleave", (e) =>{
            isErasing = false;
        })



        //a eraser functionality where, 
        // we have a eraser point -> (x, y)
        // we have already defined shapes:
        /*
        Shapes: [
            Lines: [
                {
                    startX,
                    startY,
                    endX,
                    endY,
                },
                {

                },
                {

                },
                
            ]
        ]


        */
        // return () => {
        //     canvas.
        // }

        
    }, [])

    return (
        <div>
            <canvas ref={canvasRef} className="h-screen w-screen bg-black"></canvas>
        </div>
    )
}