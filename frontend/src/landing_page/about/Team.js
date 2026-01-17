/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5  border-top">
        <h1 className="text-center">People</h1>
      </div>
      <div
        className="row p-3   text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-3 text-center">
          <img
            src="media/images/prakash2.jpg"
            style={{ borderRadius: "100%", width: "50%" }}
          />
          <h4 className="mt-5">Prakash</h4>
          <h6>Computer Science & Engineering</h6>
        </div>
        <div className="col-6 p-3" style={{fontSize:"16px"}}>
          <p>
            Hi, I'm Prakash, a passionate MERN Stack Developer with expertise in
            building scalable and efficient web applications. I specialize in
            MongoDB, Express.js, React, and Node.js, and I love crafting
            user-friendly, high-performance applications
          </p>

          <p>
            I enjoy working on full-stack projects, solving complex problems,
            and keeping up with the latest technologies in JavaScript, React.js,
            and backend optimizations.
          </p>
          <h5>Skills & Technologies</h5>
          <p>
            Frontend: React.js, Redux, Tailwind CSS, Material-UI ,HTML/CSS JavaScript
            <p>Backend: Node.js, Express.js, REST APIs, </p>
            <p>Database: MongoDB, MySQL
              </p> DevOps & Tools: Git, GitHub, Docker,Aws
          </p>

          <p>
            Connect on{" "}
            <a href="/" style={{ textDecoration: "none" }}>
              Homepage
            </a>{" "}
            /{" "}
            <a
              href="https://github.com/prakash-v181"
              style={{ textDecoration: "none" }}
            >
              Github
            </a>{" "}
            /
            <a
              href="https://www.linkedin.com/in/prakash181gupta/"
              style={{ textDecoration: "none" }}
            >
              Linkedin
            </a>
            /
            <a
              href="https://prakash-v181.github.io/resume-prakash/"
              style={{ textDecoration: "none" }}
            >
              Resume
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;
