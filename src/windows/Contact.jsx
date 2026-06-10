import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import { socials } from "../constants";

const Contact = () => {
  return (
    <>
      <div id="window-header">
        <WindowContorls target="contact" />
        <h2>Contact me</h2>
      </div>

      <div className="p-8 space-y-8 bg-white max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-6">
          <img 
            src="/images/adrian.jpg" 
            alt="Adrian" 
            className="size-20 rounded-full object-cover border border-gray-200"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-800">Let's Connect!</h3>
            <p className="text-sm text-gray-500 mt-1">Reach out on any of my profiles below.</p>
            <p className="text-sm text-gray-500 mt-1"> kartik.patil3100@gmail.com</p>
          </div>
        </div>

        <ul className="flex items-center gap-3">
          {socials.map((social) => (
            <li 
              key={social.id} 
              style={{ backgroundColor: social.bg }}
            >
              <a 
                href={social.link} 
                target="_blank" 
                rel="noreferrer"
              >
                <img src={social.icon} alt={social.text} className="size-6 invert" />
                <p>{social.text}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

const ContactWindow = WindowWrapper(Contact, "contact");
export default ContactWindow;