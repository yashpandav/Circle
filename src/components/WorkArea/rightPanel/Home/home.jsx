import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { joinedClass } from "../../../../Api/apiCaller/userapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import { Classes } from "./Helper/classBox";
import SortBy from "./Helper/sortBy";
import "./home.css";
import NoCircle from "./Helper/noCircle";

export default function HomeCircle() {
  const dispatch = useDispatch();

  const joinedClassAsTeacher = useSelector(
    (state) => state.classes.joinedClassesAsTeacher
  );
  const joinedClassAsStudent = useSelector(
    (state) => state.classes.joinedClassesAsStudent
  );
  const createdClasses = useSelector((state) => state.classes.createdClasses);

  const { toggle } = useSelector((state) => state.toggle);
  const [isFetching, setIsFetching] = useState(false);
  const [sortby, setSortBy] = useState("All");

  // Fetch only if data isn't already in Redux (e.g. loaded by left panel)
  useEffect(() => {
    if (joinedClassAsTeacher === null || joinedClassAsStudent === null) {
      setIsFetching(true);
      dispatch(joinedClass({ dispatch })).finally(() => setIsFetching(false));
    }
  }, [dispatch, joinedClassAsTeacher, joinedClassAsStudent]);

  if (isFetching) {
    return <LoaderComponent />;
  }

  const teacherList = joinedClassAsTeacher || [];
  const studentList = joinedClassAsStudent || [];
  const createdList = createdClasses || [];

  const renderClasses = () => {
    let renderCircle = [];

    if (sortby === "All") {
      // Merge teacher + student, dedup by _id
      const seen = new Set();
      renderCircle = [...teacherList, ...studentList].filter((item) => {
        if (seen.has(item._id)) return false;
        seen.add(item._id);
        return true;
      });
    } else if (sortby === "Teacher") {
      renderCircle = teacherList;
    } else if (sortby === "Student") {
      renderCircle = studentList;
    } else {
      renderCircle = createdList;
    }

    if (renderCircle.length === 0) {
      return <NoCircle />;
    }

    return renderCircle.map((item, index) => (
      <Classes item={item} key={item._id || index} />
    ));
  };

  return (
    <div className="container">
      <SortBy setSortBy={setSortBy} sortby={sortby} />
      <div className={`class-boxes ${toggle ? "panel-open" : "panel-close"}`}>
        {renderClasses()}
      </div>
    </div>
  );
}