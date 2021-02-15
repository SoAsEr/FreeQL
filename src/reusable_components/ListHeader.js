import React from 'react';

import classNames from "classnames";

const ListHeader=(props) => {
  const {label, inputLabel, checkLabel}=props;
  return (
    <>
      <div className="mt-4 w-full flex">
        <div className="place-content-center flex w-4/12 sm:w-6/12">
          {label && React.cloneElement(label, {className: classNames(label.props.className, "text-gray-500 flex items-center")})}
        </div>
        <div className="place-content-center flex pl-3 w-8/12 sm:w-6/12">
          {inputLabel && React.cloneElement(inputLabel, {className: classNames(inputLabel.props.className, "text-gray-500 flex items-center")})}
        </div>
      </div>
      <hr className="mt-2 mb-3"/>
    </>
  )
};

export default ListHeader