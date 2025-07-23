import { useEffect, useRef } from "react"

// interface shape {
//     startX: number,
//     startY: number,
//     endX: number,
//     endY: number;
// }

interface rectangle{
    startX: number,
    startY: number,
    height: number,
    width: number,
}


export function Canvas() {

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {   
        const canvas = canvasRef.current;
        if(!canvas) {
            return;
        }
        const ctx = canvas?.getContext("2d");
        if(!ctx) return;

        const shapesStore:rectangle[] = [];

        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;

        let isDrawing = false;
        const startPoint = {x:0,  y:0};
        const endPoint = {x:0, y: 0};

        ctx.strokeStyle="red"

        function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
            // not needed as now canvas takes up entire window.innerWidth and height
            const rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        canvas.addEventListener("mousedown", (e) => {
            const mousePos = getMousePos(canvas, e);
            console.log('Mouse position: ' + mousePos.x + ',' + mousePos.y);
            // now we draw a rectangle where mouse is clicked
            // ctx.strokeRect(mousePos.x,mousePos.y,1,1);
            startPoint.x = mousePos.x;
            startPoint.y = mousePos.y;
            endPoint.x = mousePos.x;
            endPoint.y = mousePos.y;
            isDrawing = true;
        })
        canvas.addEventListener("mousemove", (e) => {
            // what do we do on mousemove:
            // we clear any previous drawings:
            // next we draw a new rectangle with new coordinates:
            if(isDrawing) {
                render();
                const mousePos = getMousePos(canvas, e);
                endPoint.x = mousePos.x;
                endPoint.y = mousePos.y;
                // here we need to do something to remove all previous drawings
                ctx.strokeRect(startPoint.x,startPoint.y,endPoint.x-startPoint.x,endPoint.y-startPoint.y);
            }
        })

        canvas.addEventListener("mouseup", () => {
            //what to do on mousedown:
            if(isDrawing) {
                isDrawing = false;
                // add the new shape to shape store:
                const newShape:rectangle = {
                    startX: startPoint.x,
                    startY: startPoint.y,
                    height: endPoint.x-startPoint.x,
                    width: endPoint.y-startPoint.y, 
                }
                shapesStore.push(newShape)
            }
        })      
        function render() {
            if(!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            shapesStore.map((shp) => {
                ctx.strokeRect(shp.startX,shp.startY,shp.height, shp.width);
            })
        }
    }, [])

    return (
        <div>
            <canvas ref={canvasRef} className="h-screen w-screen border-2 border-white">
            </canvas>
        </div>
    )
}