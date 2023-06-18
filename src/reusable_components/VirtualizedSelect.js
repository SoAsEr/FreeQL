import React, { useEffect, useMemo, useRef } from "react";

import { FixedSizeList } from "react-window";

import Select from "react-select";

const VirtualizedMenuList = (props) => {
  const { children, maxHeight, getStyles, focusedOption } = props;
  const itemSize = 40;
  const childrenArray = React.Children.toArray(children);

  const listRef = useRef();
  useEffect(() => {
    if (listRef && focusedOption) {
      const index = childrenArray.findIndex(
        ({ props }) => props.value === focusedOption.value
      );
      const target = index * itemSize;
      const scrollOffset = listRef.current.state.scrollOffset;
      const height = listRef.current.props.height;
      if (target < scrollOffset) {
        listRef.current.scrollTo(target);
      }
      if (target > scrollOffset + height - itemSize) {
        listRef.current.scrollTo(target - height + itemSize);
      }
    }
  });
  return (
    <FixedSizeList
      ref={listRef}
      style={getStyles("menuList", props)}
      height={Math.min(maxHeight, itemSize * childrenArray.length)}
      itemCount={childrenArray.length}
      overscanCount={1}
      itemSize={itemSize}
    >
      {({ index, style }) => <div style={style}>{childrenArray[index]}</div>}
    </FixedSizeList>
  );
};

const VirtualizedSelect = React.forwardRef(
  ({ components, ariaLiveMessages, styles, ...props }, ref) => {
    return (
      <Select
        components={{ MenuList: VirtualizedMenuList, ...components }}
        ref={ref}
        styles={useMemo(
          () => ({
            ...styles,
            menuList: (defaultStyles) => {
              const {
                padding,
                paddingTop,
                paddingBottom,
                paddingRight,
                paddingLeft,
                ...otherStyles
              } = styles?.menuList?.(defaultStyles) ?? defaultStyles;
              return otherStyles;
            },
          }),
          [styles]
        )}
        {...props}
      />
    );
  }
);

export { VirtualizedMenuList };

export default VirtualizedSelect;
