import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { joinedClass } from "../../../../Api/apiCaller/userapicaller";
import { LoaderComponent } from "../../../Helper/Loaders/loader";
import { Classes } from "./Helper/classBox";
import SortBy from "./Helper/sortBy";
import "./home.css";

export default function HomeCircle() {
  const dispatch = useDispatch();

  const joinedClassAsTeacher = useSelector(
    (state) => state.classes.joinedClassesAsTeacher
  );
  const joinedClassAsStudent = useSelector(
    (state) => state.classes.joinedClassesAsStudent
  );
  const createdClasses = useSelector(
    (state) => state.classes.createdClasses
  );

  const { loading } = useSelector((state) => state.loading);
  const { toggle } = useSelector((state) => state.toggle);

  const [sortby, setSortBy] = useState("All");

  useEffect(() => {
    const fetchJoinedClass = () => {
      try {
        dispatch(joinedClass({ dispatch }));
      } catch (err) {
        console.error("Failed to fetch joined classes:", err);
      }
    };
    fetchJoinedClass();
  }, [dispatch]);

  if (loading) {
    return <LoaderComponent />;
  }

  const renderClasses = () => {
    if (sortby === "All") {
      return (
        <>
          {joinedClassAsTeacher?.map((item, index) => (
            <Classes item={item} key={index} />
          ))}
          {joinedClassAsStudent?.map((item, index) => (
            <Classes item={item} key={index} />
          ))}
        </>
      );
    } else if (sortby === "Teacher") {
      return joinedClassAsTeacher
        ?.filter(
          (item) => !createdClasses.some((created) => created.id === item.id)
        )
        .map((item, index) => <Classes item={item} key={index} />);
    } else if (sortby === "Student") {
      return joinedClassAsStudent?.map((item, index) => (
        <Classes item={item} key={index} />
      ));
    } else {
      return createdClasses?.map((item, index) => (
        <Classes item={item} key={index} />
      ));
    }
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
