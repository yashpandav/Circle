import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import PostContainer from "./postContainer";
import AssignmentContainer from "./assignmentContainer";

export default function ShowPostMain() {
    const currClass = useSelector((state) => state.classes.currClass);
    const [streamItems, setStreamItems] = useState([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (currClass) {
            const posts = currClass.addedPost ? currClass.addedPost.map(p => ({ ...p, itemType: 'post' })) : [];
            const assignments = currClass.addedAssignment ? currClass.addedAssignment.map(a => ({ ...a, itemType: 'assignment' })) : [];
            
            let combined = [...posts, ...assignments].sort((a, b) => {
                return new Date(b.uploadDate) - new Date(a.uploadDate);
            });
            
            const topicId = searchParams.get("topic");
            if (topicId) {
                combined = combined.filter(item => item.category === topicId);
            }
            
            setStreamItems(combined);
        }
    }, [currClass, searchParams]);
    
    if (streamItems.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        streamItems.map((item) => (
            item.itemType === 'post' 
                ? <PostContainer key={`post-${item._id}`} post={item} />
                : <AssignmentContainer key={`assignment-${item._id}`} assignment={item} />
        ))
    );
}