import { Canvas } from "./components/Canvas"
import { EraserCanvas } from "./components/EraserCanvas"
import { HandCanvas } from "./components/HandCanvas"

function App() {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div>
        {/* <Canvas /> */}
        {/* <HandCanvas /> */}
        <EraserCanvas />
      </div>
    </div>
  )
}

export default App
