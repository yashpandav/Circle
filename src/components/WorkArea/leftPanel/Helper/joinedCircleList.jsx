import React from "react";
import { useSelector } from "react-redux";
import './joinedCircleList.css';

export function Common({ item, index }) {
    let name = item.name;
    const shortName = name.charAt(0).toUpperCase();

    return (
        <div className='joined-circles' key={index}>
            <div className="circle-imgs">
                <h4>{shortName}</h4>
            </div>
            <p>{item.circleName}</p>
        </div>
    );
}

export function JoinedCircleListTeacher() {

    const joinedClassAsTeacher = useSelector(
        (state) => state.classes.joinedClassesAsTeacher
    ) || [];

    return (
        <div className="joined-circle-list">
            {joinedClassAsTeacher.length > 0 ? (
                joinedClassAsTeacher.map((item, index) => (
                    <Common item={item} index={index} key={index} />
                ))
            ) : (
                <p>No classes joined as a teacher.</p>
            )}
        </div>
    );
}

export function JoinedCircleListStudent() {

    const joinedClassAsStudent = useSelector(
        (state) => state.classes.joinedClassesAsStudent
    ) || [];

    return (
        <div className="joined-circle-list">
            {joinedClassAsStudent.length > 0 ? (
                joinedClassAsStudent.map((item, index) => (
                    <Common item={item} index={index} key={index} />
                ))
            ) : (
                <p>No classes joined as a student.</p>
            )}
        </div>
    );
}