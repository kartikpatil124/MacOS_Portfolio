import { WindowContorls } from "../components/imports";
import WindowWrapper from "../hoc/WindowWrapper";
import { blogPosts } from "../constants";
import { Search } from "lucide-react";

const Safari = () => {
    return (
        <>
            <div id="window-header">
                <WindowContorls target="safari" />
                <div className="search">
                    <Search size={15} />
                    <input
                        type="text"
                        placeholder="Search or enter website name"
                        defaultValue="https://jsmastery.com/blog"
                        readOnly
                        className="w-full bg-transparent outline-none text-xs text-gray-700"
                    />
                </div>
                <div className="w-12"></div>
            </div>

            <div className="blog">
                <h2>Articles</h2>
                <div className="space-y-6">
                    {blogPosts.map((post) => (
                        <div key={post.id} className="blog-post">
                            <div className="col-span-2">
                                <img src={post.image} alt={post.title} />
                            </div>
                            <div className="content">
                                <p>{post.date}</p>
                                <h3>{post.title}</h3>
                                <a href={post.link} target="_blank" rel="noreferrer">
                                    Read article &rarr;
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}


const safariWindow = WindowWrapper(Safari, "safari");

export default safariWindow;