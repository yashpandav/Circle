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

  // Deduplicate and separate teacher list and student list
  const teacherList = React.useMemo(() => {
    const teacher = Array.isArray(joinedClassAsTeacher) ? joinedClassAsTeacher : [];
    const created = Array.isArray(createdClasses) ? createdClasses : [];
    const map = new Map();
    [...created, ...teacher].forEach((c) => {
      if (c && c._id && !map.has(c._id.toString())) {
        map.set(c._id.toString(), c);
      }
    });
    return Array.from(map.values());
  }, [joinedClassAsTeacher, createdClasses]);

  const studentList = React.useMemo(() => {
    const students = Array.isArray(joinedClassAsStudent) ? joinedClassAsStudent : [];
    const teachingIds = new Set(teacherList.map((c) => c._id.toString()));
    const seen = new Set();
    return students.filter((item) => {
      if (!item || !item._id) return false;
      const idStr = item._id.toString();
      if (teachingIds.has(idStr)) return false;
      if (seen.has(idStr)) return false;
      seen.add(idStr);
      return true;
    });
  }, [joinedClassAsStudent, teacherList]);

  if (isFetching) {
    return <LoaderComponent />;
  }

  const createdList = createdClasses || [];

  const renderClasses = () => {
    let renderCircle = [];

    if (sortby === "All") {
      // Merge teacher + student, dedup by _id
      const seen = new Set();
      renderCircle = [...teacherList, ...studentList].filter((item) => {
        if (seen.has(item._id.toString())) return false;
        seen.add(item._id.toString());
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