import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { joinedClass } from '../../../../Api/apiCaller/userapicaller';
import LoaderComponent from "../../../loader";
import './home.css'

export default function HomeCircle() {
  const dispatch = useDispatch();
  const joinedClasses = useSelector((state) => state.classes.joinedClasses);
  const isLoading = useSelector((state) => state.classes.isLoading);

  useEffect(() => {
    const fetchJoinedClass = async () => {
      try {
        dispatch(joinedClass(dispatch));
      } catch (err) {
        console.error("Failed to fetch joined classes:", err);
      }
    };
    fetchJoinedClass();
  }, [dispatch]);

  if (isLoading) {
    return <LoaderComponent />;
  }

  return (
    <div>
      <h2>Home Component</h2>
    </div>
  );
}