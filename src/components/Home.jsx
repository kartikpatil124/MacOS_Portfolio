import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import useWindowStore from "../store/window";
import useLocationStore from "../store/loction";

gsap.registerPlugin(Draggable);

const Home = () => {
  const { locations: storeLocations, setActiveLocation } = useLocationStore();
  const { openWindow } = useWindowStore();

  // Filter out new uploaded projects so they do not show on the homescreen (desktop)
  const projects = (storeLocations.work?.children ?? []).filter(
    (project) => project.id === 5 || project.id === 6 || project.id === 7
  );

  const handleOpenProjectFinder = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };

  useGSAP(() => {
    Draggable.create(".folder");
  }, [projects]);

  return (
    <section id="home">
      <ul>
        {projects.map((project) => (
          <li 
            key={project.id} 
            className={`group folder ${project.windowPosition || ""}`}
            onClick={() => handleOpenProjectFinder(project)}
          >
            <img src="/images/folder.png" alt={project.name} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;