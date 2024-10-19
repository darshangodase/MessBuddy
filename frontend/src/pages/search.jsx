import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { HashLoader } from "react-spinners";

export default function Search() {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSidebarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl || "",
        sort: sortFromUrl || "desc",
        category: categoryFromUrl || "uncategorized",
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      if (urlParams.get("category") === "uncategorized") {
        urlParams.delete("category");
      }
      urlParams.set("limit", 9); // Set the limit to 10 posts
      const searchQuery = urlParams.toString();
      const res = await fetch(
        `https://blogbreeze-nj8u.onrender.com/api/post/getposts?${searchQuery}`
      );
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setLoading(false);
        if (data.posts.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id === "searchTerm") {
      setSidebarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSidebarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "uncategorized";
      setSidebarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    if (sidebarData.category === "uncategorized") {
      urlParams.delete("category");
    } else {
      urlParams.set("category", sidebarData.category);
    }
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numberOfPosts = posts.length;
    const startIndex = numberOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    urlParams.set("limit", 9);
    if (sidebarData.category === "uncategorized") {
      urlParams.delete("category");
    }
    const searchQuery = urlParams.toString();
    const res = await fetch(
      `https://blogbreeze-nj8u.onrender.com/api/post/getposts?${searchQuery}`
    );
    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id="sort">
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Category:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id="category"
            >
              <option value="uncategorized">Select a category</option>
              <option value="AI">Artificial Intelligence</option>
              <option value="Angular">Angular</option>
              <option value="Ansible">Ansible</option>
              <option value="AntDesign">Ant Design</option>
              <option value="AR">Augmented Reality</option>
              <option value="AWS">AWS</option>
              <option value="Azure">Azure</option>
              <option value="BabylonJs">Babylon.js</option>
              <option value="Bash">Bash</option>
              <option value="Blockchain">Blockchain</option>
              <option value="Bootstrap">Bootstrap</option>
              <option value="Bulma">Bulma</option>
              <option value="C++">C++</option>
              <option value="Capacitor">Capacitor</option>
              <option value="ChartJs">Chart.js</option>
              <option value="Chef">Chef</option>
              <option value="Chai">Chai</option>
              <option value="CI/CD">CI/CD</option>
              <option value="Clojure">Clojure</option>
              <option value="ContinuousDelivery">Continuous Delivery</option>
              <option value="ContinuousIntegration">
                Continuous Integrationn
              </option>
              <option value="CSS">CSS</option>
              <option value="Cypress">Cypress</option>
              <option value="D3Js">D3.js</option>
              <option value="DataScience">Data Science</option>
              <option value="DevOps">DevOps</option>
              <option value="DevSecOps">DevSecOps</option>
              <option value="DigitalOcean">DigitalOcean</option>
              <option value="Django">Django</option>
              <option value="Docker">Docker</option>
              <option value="EdgeComputing">Edge Computing</option>
              <option value="Electron">Electron</option>
              <option value="Elasticsearch">Elasticsearch</option>
              <option value="EthicalHacking">Ethical Hacking</option>
              <option value="ExpressJs">Express.js</option>
              <option value="Firebase">Firebase</option>
              <option value="Flask">Flask</option>
              <option value="Foundation">Foundation</option>
              <option value="F#">F#</option>
              <option value="GatsbyJs">Gatsby.js</option>
              <option value="GameDevelopment">Game Development</option>
              <option value="Git">Git</option>
              <option value="GoLang">GoLang</option>
              <option value="GraphQL">GraphQL</option>
              <option value="Grunt">Grunt</option>
              <option value="Gulp">Gulp</option>
              <option value="Haskell">Haskell</option>
              <option value="Heroku">Heroku</option>
              <option value="HTML">HTML</option>
              <option value="HybridCloud">Hybrid Cloud</option>
              <option value="Ionic">Ionic</option>
              <option value="IoT">IoT</option>
              <option value="JAMstack">JAMstack</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Jenkins">Jenkins</option>
              <option value="Jest">Jest</option>
              <option value="jQuery">jQuery</option>
              <option value="Julia">Julia</option>
              <option value="Kafka">Kafka</option>
              <option value="Kotlin">Kotlin</option>
              <option value="Kubernetes">Kubernetes</option>
              <option value="Laravel">Laravel</option>
              <option value="Linode">Linode</option>
              <option value="MachineLearning">Machine Learning</option>
              <option value="MATLAB">MATLAB</option>
              <option value="MaterialUI">Material UI</option>
              <option value="Metaverse">Metaverse</option>
              <option value="Microservices">Microservices</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Mocha">Mocha</option>
              <option value="MySQL">MySQL</option>
              <option value="Netlify">Netlify</option>
              <option value="NextJs">Next.js</option>
              <option value="NightwatchJs">Nightwatch.js</option>
              <option value="NodeJs">Node.js</option>
              <option value="NumPy">NumPy</option>
              <option value="ObjectiveC">Objective-C</option>
              <option value="OpenCV">OpenCV</option>
              <option value="OpenShift">OpenShift</option>
              <option value="Parcel">Parcel</option>
              <option value="Pandas">Pandas</option>
              <option value="Perl">Perl</option>
              <option value="PHP">PHP</option>
              <option value="PostgreSQL">PostgreSQL</option>
              <option value="Postman">Postman</option>
              <option value="PowerShell">PowerShell</option>
              <option value="Puppet">Puppet</option>
              <option value="PyTorch">PyTorch</option>
              <option value="Python">Python</option>
              <option value="QuantumComputing">Quantum Computing</option>
              <option value="ReactJs">React.js</option>
              <option value="ReactNative">React Native</option>
              <option value="Redis">Redis</option>
              <option value="Ruby">Ruby</option>
              <option value="RubyOnRails">Ruby on Rails</option>
              <option value="Rust">Rust</option>
              <option value="Scala">Scala</option>
              <option value="Security">Security</option>
              <option value="Selenium">Selenium</option>
              <option value="SemanticUI">Semantic UI</option>
              <option value="ServerlessArchitecture">
                Serverless Architecture
              </option>
              <option value="SiteReliabilityEngineering">
                Site Reliability Engineering (SRE)
              </option>
              <option value="Solidity">Solidity</option>
              <option value="Storybook">Storybook</option>
              <option value="Svelte">Svelte</option>
              <option value="Swift">Swift</option>
              <option value="TailwindCSS">Tailwind CSS</option>
              <option value="Tauri">Tauri</option>
              <option value="TensorFlow">TensorFlow</option>
              <option value="TestCafe">TestCafe</option>
              <option value="ThreeJs">Three.js</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Unity">Unity</option>
              <option value="UnrealEngine">Unreal Engine</option>
              <option value="Vagrant">Vagrant</option>
              <option value="Vercel">Vercel</option>
              <option value="Verilog">Verilog</option>
              <option value="VHDL">VHDL</option>
              <option value="VirtualReality">Virtual Reality</option>
              <option value="VueJs">Vue.js</option>
              <option value="WebSockets">WebSockets</option>
              <option value="Webpack">Webpack</option>
              <option value="Zsh">Zsh</option>
              <option value="5G">5G</option>
            </Select>
          </div>
          <Button type="submit" outline gradientDuoTone="purpleToPink">
            Apply Filters
          </Button>
        </form>
      </div>

      <div className="w-full">
        <h1 className="text-center text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5">
          Posts Results
        </h1>
        <div className="p-7 flex flex-wrap gap-4 justify-center'">
          {!loading && posts.length === 0 && (
            <p className="text-xl text-gray-500">No posts found.</p>
          )}
          {loading && (
            <div className="h-[80vh] w-full flex justify-center items-center">
              <HashLoader color="#35c9e1" />
            </div>
          )}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
        {showMore && (
          <div className="flex justify-center p-7">
            <Button
              onClick={handleShowMore}
              gradientDuoTone="purpleToBlue"
              outline
              className="h-12"
            >
              Show More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
