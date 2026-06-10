import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import useWindowStore from "../store/window";

const Text = () => {
    const { windows } = useWindowStore();
    const data = windows.txtfile.data;

    if (!data) return null;

    return (
        <>
            <div id="window-header">
                <WindowContorls target="txtfile" />
                <h2 className="font-semibold text-gray-700">{data.name}</h2>
            </div>
            
            <div className="p-6 bg-white overflow-y-auto max-h-[80vh]">
                {data.image && (
                    <img 
                        src={data.image} 
                        alt={data.name} 
                        className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
                    />
                )}
                
                {data.subtitle && (
                    <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
                        {data.subtitle}
                    </h3>
                )}

                <div className="space-y-3">
                    {Array.isArray(data.description) ? (
                        data.description.map((para, idx) => (
                            <p key={idx} className="text-sm text-gray-600 leading-relaxed font-sans">
                                {para}
                            </p>
                        ))
                    ) : (
                        <p className="text-sm text-gray-600 leading-relaxed font-sans">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

const TextWindow = WindowWrapper(Text, "txtfile");

export default TextWindow;
