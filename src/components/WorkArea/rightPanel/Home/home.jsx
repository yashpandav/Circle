import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { joinedClass } from '../../../../Api/apiCaller/userapicaller';
import { LoaderComponent, CreatingLoader } from '../../../Helper/Loaders/loader';
import { Classes } from "./Helper/classBox";
import './home.css';

export default function HomeCircle() {
  const dispatch = useDispatch();
  const joinedClassAsTeacher = useSelector((state) => state.classes.joinedClassesAsTeacher);
  const joinedClassAsStudent = useSelector((state) => state.classes.joinedClassesAsStudent);
  const {loading} = useSelector((state) => state.loading);

  useEffect(() => {
    const fetchJoinedClass = () => {
      try {
        dispatch(joinedClass(dispatch));
      } catch (err) {
        console.error("Failed to fetch joined classes:", err);
      }
    };
    fetchJoinedClass();
  }, [dispatch]);

    return <CreatingLoader />;

  return (
    <div className="container"> 
      <div className={`class-boxes`}>
        {joinedClassAsTeacher?.map((item, index) => (
          <Classes item={item} key={index}></Classes>
        ))}
        {joinedClassAsStudent?.map((item, index) => (
          <Classes item={item} key={index}></Classes>
        ))}
      </div>
    </div>
  );
}
