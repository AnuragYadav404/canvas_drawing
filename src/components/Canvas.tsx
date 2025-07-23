import { useEffect, useRef } from "react"

export function Canvas() {

    const canvasRef = useRef(null);

    useEffect(() => {
        
    }, [])

    return (
        <div>
            This renders a canvas kinda object
            <canvas ref={canvasRef} className="h-100 w-100 border-2 border-white">
            </canvas>
        </div>
    )
}