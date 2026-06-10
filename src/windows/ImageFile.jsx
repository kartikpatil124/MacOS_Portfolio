import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import useWindowStore from "../store/window";

const ImageFile = () => {
    const { windows } = useWindowStore();
    const data = windows.imgfile.data;

    if (!data) return null;

    return (
        <>
            <div id="window-header">
                <WindowContorls target="imgfile" />
                <p>{data.name}</p>
            </div>
            
            <div className="preview">
                <img src={data.imageUrl} alt={data.name} />
            </div>
        </>
    );
};

const ImageFileWindow = WindowWrapper(ImageFile, "imgfile");

export default ImageFileWindow;
