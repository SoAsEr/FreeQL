import React from "react";

const createFormatOptionLabel = (ReactComponent) => ({label}) => <ReactComponent>{label}</ReactComponent>;

export {createFormatOptionLabel}