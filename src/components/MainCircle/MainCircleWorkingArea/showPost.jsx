import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PostContainer from "./postContainer";

export default function ShowPostMain() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [allPost, setAllPost] = useState(null);

    useEffect(() => {
        if (currClass) {
            setAllPost(currClass.addedPost);
        }
    }, [currClass]);
    
    return (
        allPost && allPost.map((post, index) => (
            <PostContainer key={index} post={post} />
        ))
    );
}
