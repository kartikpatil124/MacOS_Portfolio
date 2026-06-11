import dayjs from "dayjs";
import { navLinks, navIcons } from "../constants";
import useWindowStore from "../store/window";
import useLocationStore from "../store/loction";

const Navbar = () => {
    const { openWindow } = useWindowStore();
    const { locations, setActiveLocation } = useLocationStore();

    const handleIconClick = (id) => {
        if (id === 2) {
            // Search icon -> Open Finder
            openWindow("finder");
        } else if (id === 3) {
            // Profile icon -> Open Contact
            openWindow("contact");
        } else if (id === 4) {
            // Admin icon -> Set active location to Admin and Open Finder
            if (locations.admin) {
                setActiveLocation(locations.admin);
            }
            openWindow("finder");
        }
    };

    return (
        <nav>
            <div>
                <img src="/images/logo.svg" alt="logo" />
                <p className="font-bold">Kartik's Portfolio</p>

                <ul>
                    {navLinks.map(({ id, name, type }) => (
                        <li key={id} onClick={() => openWindow(type)}>
                            <a href="#">{name}</a>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <ul>
                    {navIcons.map(({ id, img }) => (
                        <li 
                            key={id} 
                            onClick={() => handleIconClick(id)} 
                            className="cursor-pointer"
                        >
                            <img src={img} className="icon-hover" alt={`icon-${id}`} />
                        </li>
                    ))}
                </ul>

                <time>{dayjs().format('ddd MMM D h:mm A')}</time>
            </div>
        </nav>
    );
};

export default Navbar;
