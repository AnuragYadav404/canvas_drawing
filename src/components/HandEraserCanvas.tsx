import { useEffect, useRef, useState } from "react"
import { GameLogicClass } from "../game/logic";

export function HandEraserCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTool, setCurrentTool] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas?.getContext("2d");
        if(!ctx) return;
        if(!currentTool) return;

        const game = new GameLogicClass(canvas, ctx, currentTool);
        // const clearMouseHandlers = GameLogic(canvas, ctx, currentTool)
        // if(!clearMouseHandlers) {
        //     return;
        // }
 
        // function clearMouseHandlers(canvas: HTMLCanvasElement) {
        //     canvas.removeEventListener("mousedown", handleMouseDown);
        //     canvas.removeEventListener("mousemove", handleMouseMove);
        //     canvas.removeEventListener("mouseup", handleMouseUp);
        //     canvas.removeEventListener("mouseleave", handleMouseLeave);
        // }

        return () => {
            console.log("clearing events")
            // clearMouseHandlers(canvas)
            game.destroy();
            
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