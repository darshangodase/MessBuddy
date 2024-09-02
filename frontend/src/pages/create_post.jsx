import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useState } from "react";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";

export default function updatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);

  const navigate = useNavigate();

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("Image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
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
              Continuous Integration
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
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt="upload"
            className="w-full h-72 object-cover"
          />
        )}
        <ReactQuill
          theme="snow"
          placeholder="Write something..."
          className="h-72 mb-12"
          required
          onChange={(value) => {
            setFormData({ ...formData, content: value });
          }}
        />
        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>
        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
