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

            shapeStore.push(...parsedLocalStorageShapes)

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

            //evaluate for each point -> stroke end and start
            // {x,y} and {x1,y1}
            const distStart = Math.sqrt((Math.abs(x-startX)**2)+(Math.abs(y-startY)**2))
            const distEnd =  Math.sqrt((Math.abs(x-endX)**2)+(Math.abs(y-endY)**2))

            if(distStart<radius||distEnd<radius) {
                return true;
            }

            return false;
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

            for(let i = 0; i<shapeStore.length;i++) {

                const line = shapeStore[i];
                const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                if(lineIsNearToEraser) {

                    shapeStore.splice(i,1);
                }
            }
            ctx.clearRect(0,0,canvas.width, canvas.height)
            draw_stored_shapes();
        })

        canvas.addEventListener("mousemove", (e) => {
            if(isErasing) {
                const mousePos = getMousePos(e);

                for(let i = 0; i<shapeStore.length;i++) {

                    const line = shapeStore[i];
                    const lineIsNearToEraser:boolean = checkLineNearToEraser(line, mousePos);
                    if(lineIsNearToEraser) {

                        shapeStore.splice(i,1);
                    }
                }
                ctx.clearRect(0,0,canvas.width, canvas.height)
                draw_stored_shapes();
            }
        })

        canvas.addEventListener("mouseup", () =>{
            isErasing = false;
        })

        canvas.addEventListener("mouseleave", () =>{
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