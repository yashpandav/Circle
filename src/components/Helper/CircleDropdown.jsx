import React, { useState, useRef, useEffect } from "react";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import SearchIcon from "@mui/icons-material/Search";
import "./CircleDropdown.css";

export default function CircleDropdown({
    selectedCircleId = "all",
    onSelectCircle,
    circlesList = [],
    defaultLabel = "All circles",
    className = "",
    style = {},
    themeColor = "#00a896",
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Active circle calculation
    const isAllSelected = !selectedCircleId || selectedCircleId === "all";
    const activeCircle = !isAllSelected
        ? circlesList.find((c) => (c._id || c.id) === selectedCircleId)
        : null;

    const activeLabel = activeCircle ? activeCircle.name : defaultLabel;
    const activeCircleTheme = activeCircle?.classTheme || themeColor;

    // Filter circles by search query
    const filteredCircles = circlesList.filter((c) =>
        (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (circleId) => {
        if (onSelectCircle) {
            onSelectCircle(circleId);
        }
        setIsOpen(false);
        setSearchQuery("");
    };

    return (
        <div
            className={`global-circle-dropdown-wrapper ${className}`}
            ref={dropdownRef}
            style={{ "--dropdown-theme": activeCircleTheme || themeColor, ...style }}
        >
            {/* Trigger Button */}
            <button
                type="button"
                className={`global-circle-trigger-btn ${isOpen ? "open" : ""} ${isAllSelected ? "is-default" : "is-active-circle"}`}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
            >
                <div className="global-circle-selected-info">
                    {isAllSelected ? (
                        <LayersOutlinedIcon className="global-circle-selected-icon" />
                    ) : (
                        <span
                            className="global-circle-theme-dot"
                            style={{ backgroundColor: activeCircleTheme || themeColor }}
                        />
                    )}
                    <span className="global-circle-selected-label" title={activeLabel}>
                        {activeLabel}
                    </span>
                </div>
                <KeyboardArrowDownRoundedIcon
                    className={`global-circle-chevron-icon ${isOpen ? "rotate" : ""}`}
                />
            </button>

            {/* Floating Dropdown Modal Menu */}
            {isOpen && (
                <div className="global-circle-menu">
                    {/* Search box if multiple circles */}
                    {circlesList.length > 4 && (
                        <div className="global-circle-search-box">
                            <SearchIcon fontSize="small" className="global-circle-search-icon" />
                            <input
                                type="text"
                                className="global-circle-search-input"
                                placeholder="Search circles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="global-circle-options-list">
                        {/* "All circles" Option */}
                        <div
                            className={`global-circle-option-item ${isAllSelected ? "active" : ""}`}
                            onClick={() => handleSelect("all")}
                        >
                            <div className="global-circle-option-left">
                                <LayersOutlinedIcon className="global-circle-option-icon" />
                                <span className="global-circle-option-name">{defaultLabel}</span>
                            </div>
                            {isAllSelected && (
                                <CheckRoundedIcon className="global-circle-check-icon" />
                            )}
                        </div>

                        {/* Individual Circles */}
                        {filteredCircles.map((circle) => {
                            const cId = circle._id || circle.id;
                            const isSelected = selectedCircleId === cId;
                            const cTheme = circle.classTheme || themeColor;

                            return (
                                <div
                                    key={cId}
                                    className={`global-circle-option-item ${isSelected ? "active" : ""}`}
                                    onClick={() => handleSelect(cId)}
                                >
                                    <div className="global-circle-option-left">
                                        <span
                                            className="global-circle-item-dot"
                                            style={{ backgroundColor: cTheme }}
                                        />
                                        <div className="global-circle-text-group">
                                            <span className="global-circle-option-name" title={circle.name}>
                                                {circle.name}
                                            </span>
                                            {circle.subject && (
                                                <span className="global-circle-option-sub">
                                                    {circle.subject}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <CheckRoundedIcon className="global-circle-check-icon" />
                                    )}
                                </div>
                            );
                        })}

                        {circlesList.length > 0 && filteredCircles.length === 0 && (
                            <div className="global-circle-empty-msg">No matching circles found.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
