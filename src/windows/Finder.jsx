import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import useLocationStore from "../store/loction";
import useWindowStore from "../store/window";
import { locations } from "../constants";

const Finder = () => {
    const { activeLocation, setActiveLocation } = useLocationStore();
    const { openWindow } = useWindowStore();
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setSearchQuery("");
    }, [activeLocation]);

    const handleItemClick = (item) => {
        if (item.kind === "folder") {
            setActiveLocation(item);
        } else if (item.kind === "file") {
            if (item.fileType === "txt") {
                openWindow("txtfile", item);
            } else if (item.fileType === "img") {
                openWindow("imgfile", item);
            } else if (item.fileType === "pdf") {
                openWindow("resume", item);
            } else if (item.fileType === "url" && item.href) {
                window.open(item.href, "_blank");
            }
        }
    };

    const sortedChildren = activeLocation?.children
        ? [...activeLocation.children].sort((a, b) => {
            if (a.kind === "folder" && b.kind !== "folder") return -1;
            if (a.kind !== "folder" && b.kind === "folder") return 1;
            return a.name.localeCompare(b.name);
        })
        : [];

    const filteredChildren = sortedChildren.filter((child) =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div id="window-header">
                <WindowContorls target="finder" />
                <div className="flex items-center gap-1.5 border border-gray-300/60 bg-white/70 rounded px-2 py-0.5 w-48 shadow-inner focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all select-none">
                    <Search size={13} className="text-gray-400 flex-shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Search" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                    />
                </div>
            </div>

            <div className="bg-white flex h-full">
                <div className="sidebar">
                    <div>
                        <h3>Favorites</h3>
                        <ul>
                            {Object.values(locations).map((item) => (
                                <li 
                                    key={item.id} 
                                    className={activeLocation?.id === item.id ? "active" : "not-active"}
                                    onClick={() => setActiveLocation(item)}
                                >
                                    <img src={item.icon} className="w-4" alt={item.name} />
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3>Work</h3>
                        <ul>
                            {(locations.work?.children || [])
                                .filter((child) => child.kind === "folder")
                                .map((item) => (
                                    <li 
                                        key={item.id} 
                                        className={activeLocation?.id === item.id ? "active" : "not-active"}
                                        onClick={() => setActiveLocation(item)}
                                    >
                                        <img src={item.icon} className="w-4" alt={item.name} />
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>

                <div className="content">
                    {filteredChildren.length > 0 ? (
                        <ul>
                            {filteredChildren.map((child) => (
                                <li 
                                    key={child.id} 
                                    className="group"
                                    onClick={() => handleItemClick(child)}
                                >
                                    <img src={child.icon} alt={child.name} className="cursor-pointer" />
                                    <p>{child.name}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <p className="text-sm">No results found for "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;