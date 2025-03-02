import React from "react";
import { mastheadData } from "./mastheadData";
import "./Masthead.css";

/* React component that renders each department with its members.
 * <h2> is used for the department title and <h3> for each member name.
 * The members are displayed within a flex container.
 */

const Masthead = () => {
  return (
    <div className="masthead-container">
      {mastheadData.map((dept, deptIndex) => (
        <section key={deptIndex} className="department">
          <h2 className="department-title">{dept.department}</h2>
          <div className="members-container">
            {dept.members.map((member, memberIndex) => (
              <div key={memberIndex} className="member-card">
                <h3 className="member-name">{member}</h3>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Masthead;
