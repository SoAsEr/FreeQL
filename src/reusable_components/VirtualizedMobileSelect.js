import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom";
import { components } from "react-select";
import { mergeRefs } from "../utils/ref-utils";
import VirtualizedSelect, { VirtualizedMenuList } from "./VirtualizedSelect";

const SelectContainer = ({ menuIsOpen, ...props }) => {
  const ret = (
    <>
      {menuIsOpen && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          style={{
            top: "5px",
            left: "5px",
            position: "absolute",
            zIndex: "101",
          }}
          className="bi bi-arrow-left-short"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
          />
        </svg>
      )}
      <components.SelectContainer {...props} />
    </>
  );
  if (menuIsOpen) return ReactDOM.createPortal(ret, document.body);
  else {
    return ret;
  }
};

const MenuList = (props) => {
  const { getStyles } = props;

  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const onResize = (height) => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setWindowHeight]);

  const { maxHeight, ...styles } = getStyles("menuList", props);

  return (
    <VirtualizedMenuList
      {...props}
      getStyles={() => styles}
      maxHeight={windowHeight - 42}
    />
  );
};

const Input = (props) => {
  const ref = useRef();
  const prevMenuIsOpen = useRef();
  useEffect(() => {
    if (
      ref.current &&
      prevMenuIsOpen.current !== props.selectProps.menuIsOpen
    ) {
      if (props.selectProps.menuIsOpen) {
        ref.current.querySelector("input").focus();
      } else if (!props.selectProps.blurInputOnSelect) {
        ref.current.querySelector("input").focus();
      }
    }
    prevMenuIsOpen.current = props.selectProps.menuIsOpen;
  }, [props.selectProps]);
  return (
    <div ref={ref}>
      <components.Input {...props} />
    </div>
  );
};

const ComponentMobileSelect = React.forwardRef((props, ref) => {
  const [menuIsOpenState, setMenuIsOpenState] = useState();
  const menuIsOpenRef = useRef(false);

  const portalLocation = menuIsOpenRef.current ? document.body : undefined;

  const selectRef = useRef();

  const closeSelect = useCallback((e) => {
    selectRef.current.blur();
  }, []);

  useEffect(() => {
    window.addEventListener("popstate", closeSelect);
    return () => {
      window.removeEventListener("popstate", closeSelect);
    };
  }, [selectRef, closeSelect]);

  return (
    <VirtualizedSelect
      ref={mergeRefs(selectRef, ref)}
      {...props}
      styles={useMemo(
        () => ({
          container: (defaultStyles, state) => {
            if (!menuIsOpenRef.current) {
              return defaultStyles;
            } else {
              return {
                ...defaultStyles,
                position: "absolute",
                top: "0",
                width: "100%",
                height: "100vh",
                background: "#374151",
                padding: "2px",
                zIndex: "100",
              };
            }
          },
          control: (defaultStyles) => {
            if (!menuIsOpenRef.current) {
              return defaultStyles;
            } else {
              return {
                ...defaultStyles,
                borderWidth: "0",
                boxShadow: "none",
                borderRadius: "0",
                paddingLeft: "1.75rem",
              };
            }
          },
          option: (defaultStyles) => {
            if (!menuIsOpenRef.current) {
              return defaultStyles;
            } else {
              return {
                ...defaultStyles,
                display: "flex",
              };
            }
          },
          menu: (defaultStyles) => {
            if (!menuIsOpenRef.current) {
              return defaultStyles;
            } else {
              return {
                ...defaultStyles,
                marginTop: "2px",
                borderRadius: "0",
              };
            }
          },
        }),
        []
      )}
      minMenuHeight={0}
      onMenuOpen={useCallback((e) => {
        window.history.pushState(
          { ...window.history.state, needToCloseMenu: true },
          ""
        );
        menuIsOpenRef.current = true;
        setMenuIsOpenState(true);
      }, [])}
      onMenuClose={useCallback((e) => {
        if (menuIsOpenRef.current && window.history.state?.needToCloseMenu) {
          window.history.back();
        }
        menuIsOpenRef.current = false;
        setMenuIsOpenState(false);
      }, [])}
      menuIsOpen={menuIsOpenState}
      closeSelect={closeSelect}
      portalLocation={portalLocation}
      components={useMemo(
        () => ({
          ...props.components,
          SelectContainer: (props) => (
            <SelectContainer {...props} menuIsOpen={menuIsOpenRef.current} />
          ),
          MenuList,
          Input,
        }),
        [props.components]
      )}
    />
  );
});

ComponentMobileSelect.defaultProps = {
  onMenuOpen: () => {},
  onMenuClose: () => {},
  components: {},
};

export default ComponentMobileSelect;
