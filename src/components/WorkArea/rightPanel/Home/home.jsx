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
  ) || [];
  const joinedClassAsStudent = useSelector(
    (state) => state.classes.joinedClassesAsStudent
  ) || [];
  const createdClasses = useSelector((state) => state.classes.createdClasses) || [];
  const { loading } = useSelector((state) => state.loading);
  const { toggle } = useSelector((state) => state.toggle);

  const [sortby, setSortBy] = useState("All");

  useEffect(() => {
    const fetchJoinedClass = async () => {
      try {
        await dispatch(joinedClass({ dispatch }));
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
    let renderCircle = [];

    if (sortby === "All") {
      renderCircle = [...joinedClassAsTeacher, ...joinedClassAsStudent];
    } else if (sortby === "Teacher") {
      renderCircle = joinedClassAsTeacher?.filter(
        (item) => !createdClasses?.some((created) => created.id === item.id)
      );
    } else if (sortby === "Student") {
      renderCircle = joinedClassAsStudent;
    } else {
      renderCircle = createdClasses;
    }

    if (renderCircle.length === 0) {
      return <NoCircle />;
    } 

    return renderCircle?.map((item, index) => (
      <Classes item={item} key={index} />
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