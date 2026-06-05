import { useRef } from "react";
import { dockApps } from "../constants";
import { Tooltip } from "react-tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useWindowStore from "../store/window";


const Dock = () => {
    const { openWindow, closeWindow, windows } = useWindowStore();
    const dockRef = useRef(null);


    useGSAP(() => {
        const dock = dockRef.current;
        if(!dock) return;

        const icons = dock.querySelectorAll(".dock-icon");

        const handleMouseMove = (e) => {
            const { left } = dock.getBoundingClientRect();
            const mouseX = e.clientX - left;

            icons.forEach((icon) => {
                const { left: iconLeft, width } = icon.getBoundingClientRect();
                const center = iconLeft - left + width / 2;
                const distance = Math.abs(mouseX - center);
                const intensity = Math.exp(-(distance ** 2 / 2000));

                gsap.to(icon, {
                    scale: 1 + 0.35 * intensity,
                    y: -18 * intensity,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        };

        const handleMouseLeave = () => {
            icons.forEach((icon) => {
                gsap.to(icon, {
                    scale: 1,
                    y: 0,
                    duration: 0.2,
                    ease: "power2.out"
                });
            });
        };

        dock.addEventListener("mousemove", handleMouseMove);
        dock.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            dock.removeEventListener("mousemove", handleMouseMove);
            dock.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    

    const toggleApp = (app) => {
        if(!app.canOpen) return;

        const window = windows[app.id];

        if(!window) {
            console.log(`window not found : ${app.id}`);
        }

        if(window.isOpen){
            closeWindow(app.id);
        } else {
            openWindow(app.id);
        }

        console.log(windows);
        
    };


  return <section id='dock'>
        <div ref={dockRef} className='dock-container'>
            {dockApps.map(({id, name, icon, canOpen}) => (
               <div key={id} className="relative flex justify-center">
                <button 
                type="button" 
                className="dock-icon" 
                aria-label={name} 
                data-tooltip-id="dock-tooltip" 
                data-tooltip-content={name} 
                data-tooltip-delay-show={150} 
                disabled={!canOpen} 
                onClick={() => toggleApp({id, canOpen})}>
                    <img src={`/images/${icon}`} alt={name} loading="lazy" className={canOpen ? "": "opacity-50 grayscale"} />
                </button>
               </div> 
            ))}

            <Tooltip id="dock-tooltip" place="top" className="tooltip" />
        </div>
    </section>;
};

export default Dock;