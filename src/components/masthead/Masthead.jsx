import React from "react";
import { mastheadData } from "./mastheadData";
// import { previousMastheads } from "./previousMastheads";
import "./Masthead.css";

/* React component that renders each department with its members.
 * <h2> is used for the department title and <h3> for role title.
 * The members are displayed within a flex container.
 */

const Masthead = () => {
  return (
    <div className="masthead-page">
      <h1 className="page-title">Masthead</h1>

      {mastheadData.map((section, index) => (
        <section key={index} className="masthead-section">
          <h2 className="section-title">{section.sectionTitle}</h2>
          {section.roles.map((role, roleIndex) => (
            <div key={roleIndex} className="masthead-role">
              <h3 className="role-title">{role.roleTitle}:</h3>
              <p className="role-names">{role.names.join(", ")}</p>
            </div>
          ))}
        </section>
      ))}

      {/* <section className="masthead-section">
        <h2 className="section-title">Previous Mastheads</h2>
        <ul className="previous-mastheads-list">
          {previousMastheads.map((item, idx) => (
            <li key={idx} className="previous-mastheads-item">
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section> */}
    </div>
  );
};

export default Masthead;
