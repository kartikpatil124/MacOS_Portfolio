

import { useLayoutEffect, useRef } from "react";
import useWindowStore from "../store/window";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Draggable);

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex } = windows[windowKey];
    const ref = useRef(null);

    useGSAP(() => {
        const el = ref.current;
        if (!el || !isOpen) return;

        el.style.display = "block";

        gsap.fromTo(
            el,
            { scale: 0.8, opacity:0, y:40},
            {scale:1, opacity:1, y:0, duration: 0.4, ease:"poer3.out"},

        );

        
    }, [isOpen]) 

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.display = isOpen ? "block" : "none";

    },[isOpen])

    useGSAP(() => {
        if (!isOpen) return;
        Draggable.create(ref.current, {
            trigger: `#${windowKey} #window-header`,
            bounds: "main",
            onPress: () => {
                focusWindow(windowKey);
            }
        });
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <section 
            id={windowKey} 
            ref={ref} 
            style={{ zIndex }} 
            className="absolute" 
            onMouseDown={() => focusWindow(windowKey)}
        >
            <Component {...props}/>
        </section >
    )
  };

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
};

export default WindowWrapper;