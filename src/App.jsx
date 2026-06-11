import { useEffect } from "react";
import { Navbar, Welcome, Dock, Home } from "./components/imports";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { Terminal, Safari, Resume, Finder, Text, ImageFile, Contact } from "./windows";
import useLocationStore from "./store/loction";

gsap.registerPlugin(Draggable);

function App() {
  const fetchProjects = useLocationStore((state) => state.fetchProjects);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />

      <Terminal />
      <Safari />
      <Resume />
      <Finder />
      <Text />
      <ImageFile />
      <Contact />
      <Home />
    </main>
  );
}

export default App;
