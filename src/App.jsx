
import { Navbar, Welcome, Dock, Home } from "./components/imports"
import gsap from "gsap"
import {Draggable} from "gsap/Draggable"
import { Terminal, Safari, Resume, Finder, Text, ImageFile, Contact } from "./windows";
gsap.registerPlugin(Draggable);


function App() {

  return <main>
    <Navbar />
    <Welcome />
    <Dock />

    <Terminal/> 
    <Safari />
    <Resume />
    <Finder />
    <Text />
    <ImageFile />
    <Contact />
    <Home />
  </main>
}

export default App
