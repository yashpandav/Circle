import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import TopicDropdown from "../../Helper/TopicDropdown";

export default function CategoriesComponent() {
    const currClass = useSelector((state) => state.classes.currClass);
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTopicId = searchParams.get("topic");

    if (!currClass) return null;

    const isAdminOrTeacher = Boolean(
        currClass?.admin?._id === user?._id ||
        currClass?.admin === user?._id ||
        currClass?.teacher?.some((t) => (t?._id === user?._id || t === user?._id))
    );

    const handleSelectTopic = (topicId) => {
        if (!topicId || topicId === "ALL") {
            navigate(`/workarea/circle/${currClass._id}`);
        } else {
            navigate(`/workarea/circle/${currClass._id}?topic=${topicId}`);
        }
    };

    return (
        <TopicDropdown
            selectedTopic={activeTopicId}
            onSelectTopic={handleSelectTopic}
            defaultLabel="All topics"
            emptyValue=""
            showHeader={true}
            title="Topics"
            allowCreate={isAdminOrTeacher}
            allowDelete={isAdminOrTeacher}
        />
    );
}
