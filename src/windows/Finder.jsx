import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import useLocationStore from "../store/loction";
import useWindowStore from "../store/window";

const Finder = () => {
    const { 
        locations: storeLocations, 
        activeLocation, 
        setActiveLocation, 
        addProject, 
        deleteProject, 
        editProject 
    } = useLocationStore();
    const { openWindow } = useWindowStore();
    const [searchQuery, setSearchQuery] = useState("");

    // PIN State
    const [pin, setPin] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pinError, setPinError] = useState(false);

    // Admin state
    const [isEditing, setIsEditing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);

    // Form fields
    const [projName, setProjName] = useState("");
    const [projDesc, setProjDesc] = useState("");
    const [projGithub, setProjGithub] = useState("");
    const [projImage, setProjImage] = useState("");

    useEffect(() => {
        setSearchQuery("");
        if (activeLocation?.type !== "admin") {
            setIsAuthorized(false);
            setPin("");
            setPinError(false);
            setIsAdding(false);
            setIsEditing(false);
            setEditingProjectId(null);
        }
    }, [activeLocation]);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pin === "9519") {
            setIsAuthorized(true);
            setPinError(false);
        } else {
            setPinError(true);
            setPin("");
        }
    };

    const handleOpenAddForm = () => {
        setProjName("");
        setProjDesc("");
        setProjGithub("");
        setProjImage("");
        setIsAdding(true);
        setIsEditing(false);
    };

    const handleOpenEditForm = (project) => {
        const txtFile = project.children.find(c => c.fileType === "txt");
        const urlFile = project.children.find(c => c.fileType === "url");
        const imgFile = project.children.find(c => c.fileType === "img");

        setProjName(project.name);
        setProjDesc(Array.isArray(txtFile?.description) ? txtFile.description.join("\n") : txtFile?.description || "");
        setProjGithub(urlFile?.href || "");
        setProjImage(imgFile?.imageUrl || "");
        setEditingProjectId(project.id);
        setIsEditing(true);
        setIsAdding(false);
    };

    const handleCancelForm = () => {
        setIsAdding(false);
        setIsEditing(false);
        setEditingProjectId(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProjImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteProject = (id) => {
        if (window.confirm("Are you sure you want to delete this project folder? This will remove it from the Work directory and the desktop.")) {
            deleteProject(id);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const descArray = projDesc.split("\n").filter(line => line.trim() !== "");
        const isBase64 = projImage && projImage.startsWith("data:image/");

        if (isEditing) {
            editProject(editingProjectId, {
                name: projName,
                description: descArray,
                github: projGithub,
                image: isBase64 ? "" : projImage,
            }, isBase64 ? projImage : null);
        } else {
            const index = storeLocations.work.children.length;
            const newProjId = Date.now();
            const folderName = projName;

            const newProject = {
                id: newProjId,
                name: folderName,
                icon: "/images/folder.png",
                kind: "folder",
                position: "top-10 left-5",
                windowPosition: `top-[${5 + 15 * (index % 5)}vh] left-12`,
                children: [
                    {
                        id: newProjId + 1,
                        name: `${folderName} Project.txt`,
                        icon: "/images/txt.png",
                        kind: "file",
                        fileType: "txt",
                        position: "top-5 left-10",
                        description: descArray,
                    },
                    {
                        id: newProjId + 2,
                        name: `${folderName.toLowerCase().replace(/\s+/g, "-")}.com`,
                        icon: "/images/safari.png",
                        kind: "file",
                        fileType: "url",
                        href: projGithub,
                        position: "top-10 right-20",
                    },
                    ...(projImage && !isBase64 ? [{
                        id: newProjId + 3,
                        name: `${folderName.toLowerCase().replace(/\s+/g, "-")}.png`,
                        icon: "/images/image.png",
                        kind: "file",
                        fileType: "img",
                        position: "top-52 right-80",
                        imageUrl: projImage,
                    }] : []),
                ],
            };

            addProject(newProject, isBase64 ? projImage : null);
        }

        setIsAdding(false);
        setIsEditing(false);
        setEditingProjectId(null);
    };

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
                {activeLocation?.type !== "admin" ? (
                    <div 
                        onMouseDown={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 border border-gray-300/60 bg-white/70 rounded px-2 py-0.5 w-48 shadow-inner focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all"
                    >
                        <Search size={13} className="text-gray-400 flex-shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Search" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-xs text-gray-700 w-full placeholder-gray-400"
                        />
                    </div>
                ) : (
                    <div className="w-48"></div>
                )}
            </div>

            <div className="bg-white flex h-full">
                <div className="sidebar">
                    <div>
                        <h3>Favorites</h3>
                        <ul>
                            {Object.values(storeLocations).map((item) => (
                                <li 
                                    key={item.id} 
                                    className={activeLocation?.id === item.id || (activeLocation?.type === item.type && item.type === "admin") ? "active" : "not-active"}
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
                            {(storeLocations.work?.children || [])
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
                    {activeLocation?.type === "admin" ? (
                        !isAuthorized ? (
                            <div className="flex flex-col items-center justify-center w-full h-full p-8 select-none">
                                <div className="bg-gray-50 border border-gray-200/80 shadow-sm rounded-xl p-8 max-w-sm w-full text-center animate-fade-in">
                                    <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-800 mb-1">Admin Passcode</h3>
                                    <p className="text-[11px] text-gray-400 mb-6 font-medium">Please enter PIN 9519 to unlock</p>
                                    
                                    <form onSubmit={handlePinSubmit} className="space-y-4">
                                        <input
                                            type="password"
                                            maxLength={4}
                                            placeholder="••••"
                                            value={pin}
                                            onChange={(e) => {
                                                setPin(e.target.value.replace(/\D/g, ""));
                                                setPinError(false);
                                            }}
                                            className={`w-full text-center tracking-[1em] font-mono border rounded-lg py-2 px-3 outline-none text-base ${
                                                pinError ? "border-red-400 bg-red-50/50 text-red-700 animate-shake" : "border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                            }`}
                                            autoFocus
                                        />
                                        {pinError && (
                                            <p className="text-[10px] text-red-500 font-semibold">Passcode incorrect</p>
                                        )}
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg text-xs py-2 transition-all shadow-sm"
                                        >
                                            Unlock
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : isAdding || isEditing ? (
                            <div className="flex flex-col h-full p-6 bg-white w-full select-none max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">
                                            {isEditing ? "Edit Project Folder" : "Add New Project Folder"}
                                        </h3>
                                        <p className="text-[10px] text-gray-400 font-medium">
                                            Folder, txt description, and safari link files will be auto-generated.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleFormSubmit} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Project Folder Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. AI Content Creator"
                                            value={projName}
                                            onChange={(e) => setProjName(e.target.value)}
                                            className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Description (separate lines with Enter)</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="Describe your project here..."
                                            value={projDesc}
                                            onChange={(e) => setProjDesc(e.target.value)}
                                            className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-sans"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">GitHub / URL Link</label>
                                        <input
                                            type="url"
                                            required
                                            placeholder="https://github.com/..."
                                            value={projGithub}
                                            onChange={(e) => setProjGithub(e.target.value)}
                                            className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1">Optional Preview Image</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="text-[10px] text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                            />
                                            {projImage && (
                                                <img 
                                                    src={projImage} 
                                                    className="w-10 h-10 rounded object-cover border border-gray-200" 
                                                    alt="" 
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm transition-all"
                                        >
                                            Save Folder
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancelForm}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold px-4 py-2 rounded-lg transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full p-6 bg-white w-full select-none max-h-[80vh] overflow-y-auto">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-800">Admin Project Dashboard</h3>
                                        <p className="text-[10px] text-gray-400 font-medium">Add, delete, or edit project folders shown in Finder.</p>
                                    </div>
                                    <button
                                        onClick={handleOpenAddForm}
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all"
                                    >
                                        + Add Project Folder
                                    </button>
                                </div>

                                <div className="space-y-2.5 flex-1">
                                    {storeLocations.work.children.map((proj) => {
                                        const txtFile = proj.children.find(c => c.fileType === "txt");
                                        const urlFile = proj.children.find(c => c.fileType === "url");
                                        const imgFile = proj.children.find(c => c.fileType === "img");
                                        
                                        return (
                                            <div key={proj.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:border-gray-200 transition-all bg-gray-50/30 animate-fade-in">
                                                <div className="flex items-center gap-3">
                                                    <img src="/images/folder.png" className="w-8 h-8 object-contain" alt="" />
                                                    <div>
                                                        <h4 className="font-bold text-xs text-gray-700">{proj.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                                            {proj.children.length} items (
                                                            {txtFile ? ".txt " : ""}
                                                            {urlFile ? "link " : ""}
                                                            {imgFile ? ".png" : ""}
                                                            )
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenEditForm(proj)}
                                                        className="text-[10px] text-blue-500 hover:bg-blue-50/50 px-2.5 py-1 rounded-md transition-all font-bold"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(proj.id)}
                                                        className="text-[10px] text-red-500 hover:bg-red-50/50 px-2.5 py-1 rounded-md transition-all font-bold"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ) : filteredChildren.length > 0 ? (
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