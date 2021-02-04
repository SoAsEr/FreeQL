import React from 'react';

const ListHeader=(props) => {
  const {label, inputLabel, checkLabel}=props;
  return (
    <>
      <div className="mt-4 w-full">
        <div className="place-center w-1/4 sm:w-5/12">
          {label && React.cloneElement(label, {className: "text-gray-500"})}
        </div>
        <div className="place-center w-7/12 sm:w-5/12">
          {inputLabel && React.cloneElement(inputLabel, {className: "text-gray-500"})}
        </div>
        <div className="place-center w-1/6">
          {checkLabel && React.cloneElement(checkLabel, {className: "text-gray-500"})}
        </div>
      </div>
      <hr className="mt-0 mb-3"/>
    </>
  )
};

export default ListHeader