import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostContainer from "./postContainer";

export default function ShowPostMain() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [allPost, setAllPost] = useState([]);

    useEffect(() => {
        if (currClass && currClass.addedPost) {
            setAllPost([...currClass.addedPost].reverse());
        }
    }, [currClass]);
    
    if (allPost.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        allPost.map((post) => (
            <PostContainer key={post._id} post={post} />
        ))
    );
}