const createColor = require("color");
const plugin = require("tailwindcss/plugin");
var flattenColorPalette =
  require("tailwindcss/lib/util/flattenColorPalette").default;
const selectorParser = require("postcss-selector-parser");

function customTextColorCreator(value) {
  if (value === "currentColor" || value == "inherit") {
    return {
      color:
        "rgba(var(--tw-text-r), var(--tw-text-g), var(--tw-text-b), var(--tw-text-opacity))",
    };
  } else {
    const colorValue = createColor(value);
    const colorValueObject = colorValue.object();
    const colorValueOpacity = colorValue.alpha();
    return {
      "--tw-text-r": colorValueObject.r.toString(),
      "--tw-text-g": colorValueObject.g.toString(),
      "--tw-text-b": colorValueObject.b.toString(),
      "--tw-text-opacity": colorValueOpacity.toString(),
      color:
        "rgba(var(--tw-text-r), var(--tw-text-g), var(--tw-text-b), var(--tw-text-opacity))",
    };
  }
}

module.exports = {
  mode: "jit",
  purge: {
    content: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
  },
  theme: {
    screens: {
      xs: "430px",
      sm: "690px",
      md: "768px",
      lg: "1024px",
      xl: "1400px",
      print: { "raw": "print" },
    },
    borderWidth: {
      DEFAULT: "thin", //fix for chrome 1px borders
      0: "0px",
      2: "2px",
      4: "4px",
      8: "8px",
    },
    rotate: {
      "0": "0",
      "45": "45deg",
      "90": "90deg",
      "135": "135deg",
      "180": "180deg",
      "225": "225deg",
      "270": "270deg",
      "315": "315deg",
    },
    extend: {
      minWidth: (theme) => theme("width"),
      minHeight: (theme) => theme("height"),
      maxWidth: (theme) => theme("width"),
      maxHeight: (theme) => theme("height"),
    },
  },
  corePlugins: {
    //textColor: false,
    divideWidth: false,
  },
  plugins: [
    /*
    plugin(function ({ addUtilities, config }) {
      const colors = config().theme.colors;
      const textColorUtils = {};
      for (const color in colors) {
        if (typeof colors[color] === "string") {
          textColorUtils[`.text-${color}`] = customTextColorCreator(
            colors[color]
          );
        } else if (typeof colors[color] === "object") {
          for (const variant in colors[color]) {
            textColorUtils[`.text-${color}-${variant}`] =
              customTextColorCreator(colors[color][variant]);
          }
        }
      }
      addUtilities(textColorUtils, {
        variants: config().variants.textColor,
      });
    }),
    */
    plugin(function ({ addVariant, e }) {
      addVariant("children", ({ modifySelectors, separator }) => {
        return modifySelectors(({ selector }) => {
          return selectorParser((selectors) => {
            selectors.walkClasses((classNode) => {
              classNode.value = `children${separator}${classNode.value}`;
              classNode.parent.insertAfter(
                classNode,
                selectorParser().astSync(` > *`)
              );
            });
          }).processSync(selector);
        });
      });
    }),
    plugin(function ({ addUtilities, e, theme, variants, config }) {
      let colors = flattenColorPalette(config().theme.colors);
      delete colors["default"];

      const colorMap = Object.keys(colors).map((color) => ({
        [`.border-t-${color}`]: { borderTopColor: colors[color] },
        [`.border-r-${color}`]: { borderRightColor: colors[color] },
        [`.border-b-${color}`]: { borderBottomColor: colors[color] },
        [`.border-l-${color}`]: { borderLeftColor: colors[color] },
      }));
      const utilities = Object.assign({}, ...colorMap);

      addUtilities(utilities, variants("borderColor"));
    }),
  ],
};
