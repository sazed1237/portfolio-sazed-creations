import Home, { HomeBlog } from "../Home";
import Services from "../../Services/Services";
import Resume from "../../Resume/Resume";
import Work from "../../Work/Work";
import Contact from "../../Contact/Contact";

const MainHome = ({ initialProjects = [], initialPosts = [] }) => {
  return (
    <div>
      <Home />
      <Services></Services>
      <Resume></Resume>

      <Work initialProjects={initialProjects}></Work>

      <HomeBlog initialPosts={initialPosts} />

      <div className="pb-12">
        <Contact></Contact>
      </div>
    </div>
  );
};

export default MainHome;
