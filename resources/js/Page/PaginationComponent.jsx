import React, { useState } from "react";

const Pagination = ({ data, itemsPerPage }) => {
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the index of the first and last item of the current page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

    // Function to handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Render pagination buttons
    const renderPagination = () => {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(data.length / itemsPerPage); i++) {
            pageNumbers.push(
                <li key={i} className={i === currentPage ? "active" : ""}>
                    <button onClick={() => handlePageChange(i)}>{i}</button>
                </li>
            );
        }
        return pageNumbers;
    };

    return (
        <div>
            <ul className="pagination">{renderPagination()}</ul>
            <div className="data">
                {/* Render your current items here */}
                {currentItems.map((item, index) => (
                    <div key={index}>
                        {/* Render your item component here */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pagination;
